import * as domain from 'domain';
import * as Sentry from '@sentry/node';
import { Document, EJSON } from 'bson';
import BullQueue, { Queue, Job, JobOptions } from 'bull';
import chalk from 'chalk';
import config from '../core/config';

export type ProcessFunction<Message> = (message: Message, job: Job<Document>) => Promise<void> | void;

export type QueuePeriodicPlans<Message> = {
    message: Message;
    repeat: JobOptions['repeat'];
    jobId: string;
};

export type QueueHandlerOptions<Message> = {
    jobOptions: Omit<JobOptions, 'repeat'>;
    getLabel: (message: Message) => string;
};

export class QueueHandler<Message = any> {
    public readonly queueName;

    public readonly queue: Queue<Document>;

    private readonly processFunction: ProcessFunction<Message>;

    private readonly options?: QueueHandlerOptions<Message>;

    public constructor(
        queueName: string,
        processFunction: ProcessFunction<Message>,
        options?: Partial<QueueHandlerOptions<Message>>
    ) {
        this.queueName = queueName;
        this.queue = new BullQueue(queueName, config.redis.uri);
        this.processFunction = processFunction;

        this.options = {
            jobOptions: {
                // by default always clean up from redis
                removeOnFail: !config.bull.persistJobs,
                removeOnComplete: !config.bull.persistJobs,
                ...options?.jobOptions,
            },
            getLabel: options?.getLabel || (() => this.queueName),
        };
    }

    public async isHealthy() {
        // ping redis to test it
        await this.queue.client.ping();

        return true;
    }

    public add(message: Message, options?: JobOptions): Promise<Job<Document>> {
        const serializedMessage = EJSON.serialize(message);

        return this.queue.add(serializedMessage, { ...this.options.jobOptions, ...options });
    }

    private async setupPeriodicPlan(plans: QueuePeriodicPlans<Message>[] = []) {
        const jobs = await this.queue.getRepeatableJobs();

        // initialize repeatable jobs
        const jobIds = plans.length
            ? await Promise.all(
                  plans.map(async plan => {
                      // ensure the job is registered
                      await this.add(plan.message, {
                          repeat: plan.repeat,
                          ...this.options.jobOptions,
                          jobId: plan.jobId,
                      });

                      return plan.jobId;
                  })
              )
            : [];

        // remove zombies (jobs not run anymore)
        const promises = jobs
            .filter(job => !jobIds.includes(job.id))
            .map(job => this.queue.removeRepeatableByKey(job.key));

        if (promises.length) {
            await Promise.all(promises);
        }

        // print final list of repeatable jobs for debugging
        await this.printRepeatableJobs();
    }

    public async printRepeatableJobs() {
        const jobs = await this.queue.getRepeatableJobs();
        jobs.forEach(job => console.info(chalk.cyan(`Run repeatable job ${job.key} on queue ${this.queueName}`)));
    }

    private async handleJob(job: Job<Document>) {
        const startTime = getRecordTime();
        const local = domain.create();

        local.on('error', error => {
            // print it for debug purposes
            console.info(chalk.red(`Failed to execute ${this.queueName}`));
            console.error(error);

            // capture with Sentry too
            Sentry.captureException(error);

            // move the job to failed
            job.moveToFailed(error);
        });

        return local.run(async () => {
            const transaction = Sentry.startTransaction({
                op: 'task',
                name: this.queueName,
            });

            Sentry.configureScope(scope => {
                scope.setSpan(transaction);
            });

            let message: Message = null;
            let succeed = true;

            try {
                message = EJSON.deserialize(job.data) as Message;

                const promise = this.processFunction(message, job);

                if (promise instanceof Promise) {
                    await promise;
                }
            } catch (error) {
                // print it for debug purposes
                console.info(chalk.red(`Failed to execute ${this.queueName}`));
                console.error(error);

                Sentry.withScope(scope => {
                    if (message) {
                        scope.setExtra('message', message);
                    }

                    Sentry.captureException(error);
                });

                // set the job as failed
                await job.moveToFailed(error);

                // set as errored
                succeed = false;
            } finally {
                transaction.finish();

                // we may want to log it
                if (config.verbose) {
                    const timeElapsed = getTimeElapsed(startTime);
                    const state = succeed ? chalk.green('COMPLETED') : chalk.red('FAILED');
                    const label = this.options.getLabel(message);
                    console.info(`BULL ${label} ${state} ${timeElapsed}`);
                }
            }
        });
    }

    public setupWorker(plans?: QueuePeriodicPlans<Message>[] | false): QueueHandler<Message> {
        this.queue.process(this.handleJob.bind(this));

        if (plans !== false) {
            // we managed the periodic tasks
            this.setupPeriodicPlan(plans);
        }

        return this;
    }

    public stop(): Promise<void> {
        return this.queue.close();
    }
}

const getRecordTime = () => ({
    startAt: process.hrtime(),
    startTime: new Date(),
});

type RecordTime = ReturnType<typeof getRecordTime>;

const getTimeElapsed = (start: RecordTime, end: RecordTime = getRecordTime()) => {
    // calculate diff
    const ms = (end.startAt[0] - start.startAt[0]) * 1e3 + (end.startAt[1] - start.startAt[1]) * 1e-6;

    // return truncated value
    return ms.toFixed(3);
};

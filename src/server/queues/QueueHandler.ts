import * as domain from 'domain';
import * as Sentry from '@sentry/node';
import { Document, EJSON } from 'bson';
import BullQueue, { Queue, Job, JobOptions } from 'bull';
import chalk from 'chalk';
import config from '../core/config';

/* comes from BullJS
 * https://github.com/OptimalBits/bull/blob/46fcba14bc01885c1ca518b3399ec474bb88b71d/lib/repeatable.js#L177
 * */
const getRepeatKey = (repeat: JobOptions['repeat']): string => {
    // @ts-ignore
    const jobId = repeat.jobId ? `${repeat.jobId}:` : ':';
    const endDate = repeat.endDate ? `${new Date(repeat.endDate).getTime()}:` : ':';
    const tz = repeat.tz ? `${repeat.tz}:` : ':';
    // @ts-ignore
    const suffix = repeat.cron ? tz + repeat.cron : String(repeat.every);

    return `__default__:${jobId}${endDate}${suffix}`;
};

export type ProcessFunction<Message> = (message: Message, job: Job<Document>) => Promise<void> | void;

export type QueuePeriodicPlans<Message> = { message: Message; repeat: JobOptions['repeat'] };

export class QueueHandler<Message = any> {
    public readonly queueName;

    public readonly queue: Queue<Document>;

    private readonly processFunction: ProcessFunction<Message>;

    private readonly jobOptions?: JobOptions;

    public constructor(
        queueName: string,
        processFunction: ProcessFunction<Message>,
        jobOptions?: Omit<JobOptions, 'repeat'>
    ) {
        this.queueName = queueName;
        this.queue = new BullQueue(queueName, config.redis.uri);
        this.processFunction = processFunction;
        this.jobOptions = { removeOnComplete: true, ...jobOptions };
    }

    public add(message: Message, options?: JobOptions): Promise<Job<Document>> {
        const serializedMessage = EJSON.serialize(message);

        return this.queue.add(serializedMessage, { ...this.jobOptions, ...options });
    }

    private async setupPeriodicPlan(plans: QueuePeriodicPlans<Message>[] = []) {
        const jobs = await this.queue.getRepeatableJobs();

        const existingKeys = plans
            .map(plan => {
                // get the repeat job key
                const repeatJobKey = getRepeatKey(plan.repeat);

                // look for a match
                const matchingJob = jobs.find(job => job.key === repeatJobKey);

                if (!matchingJob) {
                    // add a new job
                    this.add(plan.message, { repeat: plan.repeat, ...this.jobOptions });
                }

                return matchingJob ? repeatJobKey : undefined;
            })
            .filter(Boolean);

        // remove outdated job
        jobs.filter(job => !existingKeys.includes(job.key)).forEach(job => {
            this.queue.removeRepeatableByKey(job.key);
        });
    }

    private async handleJob(job: Job<Document>) {
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
            } finally {
                transaction.finish();
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

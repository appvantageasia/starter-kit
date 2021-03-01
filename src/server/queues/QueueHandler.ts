import * as Sentry from '@sentry/node';
import { Document, EJSON } from 'bson';
import BullQueue, { Queue, Job, JobOptions } from 'bull';
import chalk from 'chalk';
import config from '../config';

export type ProcessFunction<Message> = (message: Message, job: Job<Document>) => Promise<void> | void;

export class QueueHandler<Message = any> {
    public readonly queueName;

    public readonly queue: Queue<Document>;

    private readonly processFunction: ProcessFunction<Message>;

    public constructor(queueName: string, processFunction: ProcessFunction<Message>) {
        this.queueName = queueName;
        this.queue = new BullQueue(queueName, config.redis.uri);
        this.processFunction = processFunction;
    }

    public add(message: Message, options?: JobOptions): Promise<Job<Document>> {
        const serializedMessage = EJSON.serialize(message);

        return this.queue.add(serializedMessage, options);
    }

    public setupWorker(): QueueHandler<Message> {
        this.queue.process(async job => {
            const transaction = Sentry.startTransaction({
                op: 'task',
                name: this.queueName,
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

        return this;
    }

    public stop(): Promise<void> {
        return this.queue.close();
    }
}

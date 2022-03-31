import { Document } from 'bson';
import { Job } from 'bull';
import { QueueHandler } from './QueueHandler';
import * as implementations from './implementations';

export type QueueMessage =
    | ({ type: 'dummy' } & implementations.DummyMessage)
    | ({ type: 'workerBeat' } & implementations.WorkerBeatMessage);

const mainQueueHandler = (message: QueueMessage, job: Job<Document>) => {
    switch (message.type) {
        case 'dummy':
            return implementations.dummyHandler(message, job);

        case 'workerBeat':
            return implementations.workerBeatHandler(message, job);

        default:
            // @ts-ignore
            throw new Error(`Message of type "${message.type}" is unknown to the worker`);
    }
};

export const mainQueue = new QueueHandler('main', mainQueueHandler, {
    getLabel: message => `main.${message.type}`,
});

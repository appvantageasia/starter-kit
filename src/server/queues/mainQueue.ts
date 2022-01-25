import { Document } from 'bson';
import { Job } from 'bull';
import { QueueHandler } from './QueueHandler';
import * as implementations from './implementations';

export type QueueMessage =
    | ({ type: 'resetPasswordNotification' } & implementations.ResetPasswordNotificationMessage)
    | ({ type: 'workerBeat' } & implementations.WorkerBeatMessage)
    | ({ type: 'onUserAuthentication' } & implementations.OnUserAuthenticationMessage);

const mainQueueHandler = (message: QueueMessage, job: Job<Document>) => {
    switch (message.type) {
        case 'resetPasswordNotification':
            return implementations.resetPasswordNotificationHandler(message, job);

        case 'workerBeat':
            return implementations.workerBeatHandler(message, job);

        case 'onUserAuthentication':
            return implementations.onUserAuthenticationHandler(message, job);

        default:
            // @ts-ignore
            throw new Error(`Message of type "${message.type}" is unknown to the worker`);
    }
};

export const mainQueue = new QueueHandler('main', mainQueueHandler, {
    getLabel: message => `main.${message.type}`,
});

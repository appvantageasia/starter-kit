import { Document } from 'bson';
import { Job } from 'bull';
import { sendDummyEmail } from '../emails';
import { QueueHandler } from './QueueHandler';

export type DummyMessage = { value: string };

const handler = async (message: DummyMessage, job: Job<Document>) => {
    await sendDummyEmail({
        subject: 'test',
        to: 'noreply@appvantage.co',
        data: { text: message.value },
    });
};

export const dummyQueue = new QueueHandler('dummy', handler);

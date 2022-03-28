import { Document } from 'bson';
import { Job } from 'bull';
import { sendDummyEmail } from '../../emails';

export type DummyMessage = { value: string };

export const dummyHandler = async (message: DummyMessage, job: Job<Document>) => {
    await sendDummyEmail({
        subject: 'test',
        to: 'noreply@appvantage.co',
        data: { text: message.value },
    });
};

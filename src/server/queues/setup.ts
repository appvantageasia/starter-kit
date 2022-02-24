import { dummyQueue } from './implementations/dummyQueue';
import stopAllQueues from './stopAllQueues';

const setup = (): (() => Promise<void>) => {
    // provide a periodic plan to send an email every hour
    dummyQueue.setupWorker([
        {
            message: { value: 'periodic' },
            repeat: { cron: '0 * * * *' },
        },
    ]);

    return async () => {
        // close queues
        await stopAllQueues();
    };
};

export default setup;

import { QueueHandler } from './QueueHandler';
import { dummyQueue } from './dummyQueue';

const setup = (): (() => Promise<void>) => {
    // first initialize every queues
    const queues: QueueHandler[] = [
        dummyQueue.setupWorker([
            // provide a periodic plan to send an email every hour
            {
                message: { value: 'periodic' },
                repeat: { cron: '0 * * * *' },
            },
        ]),
    ];

    return async () => {
        // close queues
        await Promise.all(queues.map(queue => queue.stop()));
    };
};

export default setup;

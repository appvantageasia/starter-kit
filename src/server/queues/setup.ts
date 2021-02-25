import { QueueHandler } from './QueueHandler';
import { dummyQueue } from './dummyQueue';

const setup = (): (() => Promise<void>) => {
    // first initialize every queues
    const queues: QueueHandler[] = [dummyQueue.setupWorker()];

    // then schedule periodic jobs
    // dummyQueue.add({ value: 'periodic' }, { repeat: { cron: '10 * * * *' } });

    return async () => {
        // close queues
        await Promise.all(queues.map(queue => queue.stop()));
    };
};

export default setup;

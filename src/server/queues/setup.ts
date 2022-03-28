import { mainQueue } from './mainQueue';
import stopAllQueues from './stopAllQueues';

export const queues = [mainQueue];

const setup = (): (() => Promise<void>) => {
    // setup periodic jobs on the main queue
    mainQueue.setupWorker([
        // provide a periodic plan to send an email every hour
        {
            message: { value: 'periodic', type: 'dummy' },
            repeat: { cron: '0 * * * *' },
        },
        // run a worker beat every 10s
        {
            message: { type: 'workerBeat' },
            repeat: { every: 10000 },
        },
    ]);

    return async () => {
        // close queues
        await stopAllQueues();
    };
};

export default setup;

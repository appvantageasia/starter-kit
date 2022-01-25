import config from '../core/config';
import { QueuePeriodicPlans } from './QueueHandler';
import { mainQueue, QueueMessage } from './mainQueue';
import stopAllQueues from './stopAllQueues';

export const queues = [mainQueue];

const setup = (): (() => Promise<void>) => {
    const mainQueueJobs: QueuePeriodicPlans<QueueMessage>[] = [];

    if (config.healthChecks.workerBeat) {
        mainQueueJobs.push({
            message: { type: 'workerBeat' },
            repeat: { every: 10000 },
            jobId: 'workerBeat',
        });
    }

    // setup periodic jobs on the main queue
    mainQueue.setupWorker(mainQueueJobs);

    return async () => {
        // close queues
        await stopAllQueues();
    };
};

export default setup;

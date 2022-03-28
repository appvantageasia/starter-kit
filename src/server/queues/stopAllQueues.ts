import { queues } from './setup';

const stopAllQueues = () => Promise.all(Object.values(queues).map(queue => queue.stop()));

export default stopAllQueues;

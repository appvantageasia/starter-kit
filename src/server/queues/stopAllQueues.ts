import * as queues from './implementations';

const stopAllQueues = () => Promise.all(Object.values(queues).map(queue => queue.stop()));

export default stopAllQueues;

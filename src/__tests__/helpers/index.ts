export * from './apollo';
export * from './database';
export * from './formData';
export * from './storage';
export { default as stopAllQueues } from '../../server/queues/stopAllQueues';

export const composeHandlers =
    (...handlers: (() => Promise<void>)[]) =>
    () =>
        handlers.reduce((promise, handler) => promise.then(handler), Promise.resolve());

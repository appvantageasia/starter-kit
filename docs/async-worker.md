# Asynchronous Worker

Asynchronous workers based on [BullJS][bull] are setup for the project.
It gives us the capability to asynchronously execute operations/tasks which may either be too heavy for the browser/user
to wait or for which there is no need to wait.

Messages (job data) are serialized to EJSON using the [bson] library. By doing so some native types may be pass through messages to worker such as :

-   ObjectID from MongoDB
-   Date objects

[bson]: https://github.com/mongodb/js-bson#readme
[bull]: https://optimalbits.github.io/bull/

All jobs/workers are defined in the `src/server/queues` directory

## Example

First create a file for your new job such as `dummyQueue.ts` in which you will have the following code

```ts
// we need the Document type from bson
import { Document } from 'bson';
// we need the Job type from bull
import { Job } from 'bull';
// we will use the QueueHandler to create our queue/job
import { QueueHandler } from './QueueHandler';

// message (arguments) our queue requires
export type DummyMessage = { value: string };

// our handler to execute the code
const handler = async (message: DummyMessage, job: Job<Document>) => {
    // then here we do whatever we need to execute here
    // for example print the value
    console.info(message.value);
};

// create our queue instance
// the name must be uniq (here it's "yummy")
export const dummyQueue = new QueueHandler('dummy', handler);
```

After what you may first export your queue types and instance from the queues entry points (`src/server/queues/index.ts`) :

```ts
// simply export everything here
export * from './dummyQueue';
export { default as setup } from './setup';
```

Finally, add your queue in the setup method (in `src/server/queues/setup.ts`)

```ts
import { QueueHandler } from './QueueHandler';
import { dummyQueue } from './dummyQueue';

const setup = (): (() => Promise<void>) => {
    // first initialize every queues
    const queues: QueueHandler[] = [
        // your new queue here
        dummyQueue.setupWorker(),

        // or if you want to plannify period job
        // you may provide the list to schedule as follow :
        dummyQueue.setupWorker([
            {
                // the job data
                message: { value: 'whatever' },
                // and the repeat definition as BullJS expects it
                repeat: { cron: '10 * * * *' },
            },
        ]),

        // if you want to manually handle the periodic jobs rather than relying on the homemade scheduler
        // simply provide false instead
        dummyQueue.setupWorker(false),
    ];

    return async () => {
        // close queues
        await Promise.all(queues.map(queue => queue.stop()));
    };
};

export default setup;
```

If you remove a periodic queue you may need to remove the scheduler from data migration.
To understand how please read the documentation on BullJS.

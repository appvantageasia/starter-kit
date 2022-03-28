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

First create a file for your new job such as `implementations/dummyQueue.ts` in which you will have the following code

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
export const dummyJandler = async (message: DummyMessage, job: Job<Document>) => {
    // then here we do whatever we need to execute here
    // for example print the value
    console.info(message.value);
};
```

After what you may first export your queue types and instance from the implementation entry point (`src/server/queues/implementations/index.ts`) :

```ts
// add the following line to export everything fromt he file you just created
export * from './dummyQueue';
```

Then, if you want your job to be included in the main queue you should add it to the main handler (in `src/server/queues/mainQueue.ts`)

```ts
// add it to the message types
export type QueueMessage =
    | ({ type: 'dummy' } & implementations.DummyMessage)
    | ({ type: 'otherType' } & implementations.OtherTypeMessage);

const mainQueueHandler = (message: QueueMessage, job: Job<Document>) => {
    switch (message.type) {
        /* .... */

        case 'dummy':
            return implementations.dummyHandler(message, job);

        /* .... */
    }
};
```

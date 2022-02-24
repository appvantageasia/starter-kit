import { EJSON, Document } from 'bson';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { createRedisInstance } from './redis';

export const getPubSub = (): RedisPubSub => {
    if (global.pubSub) {
        return global.pubSub;
    }

    global.pubSub = new RedisPubSub({
        publisher: createRedisInstance(),
        subscriber: createRedisInstance(),
        serializer: (source: Document): string => JSON.stringify(EJSON.serialize(source)),
        deserializer: (source: string): Document => EJSON.deserialize(JSON.parse(source)) as Document,
    });

    return global.pubSub;
};

export type SubscriptionTriggerGenerators<TMessage, TSubArgs extends any[]> = {
    fromMessage: (message: TMessage) => string;
    fromArgs: (...args: TSubArgs) => string[];
};

export class Subscription<TMessage, TSubArgs extends any[] = []> {
    private readonly trigger: SubscriptionTriggerGenerators<TMessage, TSubArgs>;

    private readonly name: string;

    constructor(trigger: string | SubscriptionTriggerGenerators<TMessage, TSubArgs>, name: string) {
        this.trigger =
            typeof trigger === 'string'
                ? {
                      fromMessage: () => trigger,
                      fromArgs: () => [trigger],
                  }
                : trigger;

        this.name = name;
    }

    public subscribe(...args: TSubArgs): AsyncIterator<any> {
        return getPubSub().asyncIterator(this.trigger.fromArgs(...args));
    }

    public publish(message: TMessage): void {
        getPubSub().publish(this.trigger.fromMessage(message), { [this.name]: message });
    }
}

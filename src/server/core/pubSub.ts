import { EJSON, Document } from 'bson';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import IORedis from 'ioredis';
import config from './config';

const getPubSub = (): RedisPubSub => {
    if (global.pubSub) {
        return global.pubSub;
    }

    global.pubSub = new RedisPubSub({
        publisher: new IORedis(config.redis.uri, { enableOfflineQueue: false }),
        subscriber: new IORedis(config.redis.uri, { enableOfflineQueue: false }),
        serializer: (source: Document): string => JSON.stringify(EJSON.serialize(source)),
        deserializer: (source: string): Document => EJSON.deserialize(JSON.parse(source)) as Document,
    });

    return global.pubSub;
};

export default getPubSub;

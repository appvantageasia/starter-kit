import IORedis, { Redis } from 'ioredis';
import config from './config';

const getRedisInstance = (): Redis => {
    if (global.redis) {
        return global.redis;
    }

    global.redis = new IORedis(config.redis.uri, { enableOfflineQueue: false });

    return global.redis;
};

export default getRedisInstance;

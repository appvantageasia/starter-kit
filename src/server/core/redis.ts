import IORedis, { Redis, RedisOptions } from 'ioredis';
import config from './config';

export const createRedisInstance = () => {
    const details = new URL(config.redis.uri);

    const options: RedisOptions = {
        enableOfflineQueue: false,
    };

    if (config.redis.sentinel) {
        options.sentinels = [{ host: details.hostname, port: parseInt(details.port, 10) }];
        options.sentinelUsername = details.username || undefined;
        options.sentinelPassword = details.password || undefined;
    } else {
        options.host = details.hostname;
        options.port = parseInt(details.port, 10);
        options.username = details.username || undefined;
        options.password = details.password || undefined;
    }

    return new IORedis(options);
};

const getRedisInstance = (): Redis => {
    if (global.redis) {
        return global.redis;
    }

    global.redis = createRedisInstance();

    return global.redis;
};

export default getRedisInstance;

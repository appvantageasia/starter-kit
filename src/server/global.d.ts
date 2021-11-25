import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Redis } from 'ioredis';
import { DatabaseContext } from './database';

declare global {
    declare module NodeJS {
        interface Global {
            mongo?: {
                context: Pick<DatabaseContext, 'regular' | 'encrypted'>;
                promise: Promise<Pick<DatabaseContext, 'regular' | 'encrypted'>>;
            };
            redis?: Redis;
            pubSub?: RedisPubSub;
        }
    }
}

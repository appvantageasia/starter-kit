import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Redis } from 'ioredis';
import { DatabaseContext } from '../server/database';

declare global {
    declare module NodeJS {
        interface Process {
            readonly browser?: boolean;
            readonly isDev?: boolean;
            readonly isCLI?: boolean;
        }

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

import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Redis } from 'ioredis';
import { MongoClient, Db } from 'mongodb';

declare global {
    declare module NodeJS {
        interface Global {
            mongo?: {
                instance: { mongoClient: MongoClient; db: Db };
                promise: Promise<{ mongoClient: MongoClient; db: Db }>;
            };
            redis?: Redis;
            pubSub?: RedisPubSub;
        }
    }
}

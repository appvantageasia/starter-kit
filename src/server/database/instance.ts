import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import config from '../core/config';
import { Collections, getCollections } from './collections';

export type DatabaseContext = {
    mongoClient: MongoClient;
    db: Db;
    collections: Collections;
};

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */

if (!global.mongo) {
    // update the global store
    global.mongo = { instance: null, promise: null };
}

let cached: DatabaseContext = null;

export const getDatabaseContext = async (): Promise<DatabaseContext> => {
    if (cached && global.mongo.instance) {
        return cached;
    }

    if (!global.mongo.promise) {
        // get mongodb options
        const options: MongoClientOptions = {
            maxPoolSize: config.db.pool,
        };

        // get the promise
        global.mongo.promise = MongoClient.connect(config.db.uri, options).then(mongoClient => ({
            mongoClient,
            db: mongoClient.db(config.db.name),
        }));
    }

    // wait for it
    // and assigned it globally
    global.mongo.instance = await global.mongo.promise;

    // update the cache
    cached = {
        ...global.mongo.instance,
        collections: getCollections(global.mongo.instance.db),
    };

    // finally return the cache
    return cached;
};

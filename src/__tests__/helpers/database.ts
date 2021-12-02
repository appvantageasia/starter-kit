import { Document, EJSON } from 'bson';
import { getDatabaseContext, migrate } from '../../server/database';

export const setupDatabase = async (): Promise<void> => {
    // get the database
    const { db } = await getDatabaseContext();
    // execute migrations
    await migrate(db, false);
};

export const cleanDatabase = async (): Promise<void> => {
    // get the database
    const { db, mongoClient } = await getDatabaseContext();
    // drop the database
    await db.dropDatabase();
    // close database
    await new Promise(resolve => {
        mongoClient.close(resolve);
    });
    // reset mongo global store
    global.mongo = { instance: null, promise: null };
};

export type Fixtures = { [collection: string]: Document[] };

export const loadFixtures = (fixtures: Fixtures) => async (): Promise<void> => {
    // get the database
    const { db } = await getDatabaseContext();

    // use bulk operations to write new entries in the database for each collection
    const promises = Object.entries(EJSON.deserialize(fixtures)).map(([collection, documents]) =>
        db.collection(collection).bulkWrite(documents.map(document => ({ insertOne: { document } })))
    );

    // wait for them all
    await Promise.all(promises);
};

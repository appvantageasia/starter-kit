import { Document, EJSON } from 'bson';
import { getDatabaseContext, migrate } from '../../server/database';

export const setupDatabase = async (): Promise<void> => {
    // get the database
    const context = await getDatabaseContext();
    // execute migrations
    await migrate(context, false);
};

export const cleanDatabase = async (): Promise<void> => {
    // get the database
    const { regular } = await getDatabaseContext();

    // drop the database (regular and encrypted are on the same database)
    await regular.db.dropDatabase();

    // close regular database
    await new Promise(resolve => {
        regular.client.close(resolve);
    });

    // reset mongo global store
    global.mongo = { context: null, promise: null };
};

export type Fixtures = { [collection: string]: Document[] };

export const loadFixtures = (fixtures: Fixtures) => async (): Promise<void> => {
    // get the database
    const { regular } = await getDatabaseContext();

    // use bulk operations to write new entries in the database for each collection
    const promises = Object.entries(EJSON.deserialize(fixtures)).map(([collection, documents]) =>
        regular.db.collection(collection).bulkWrite(documents.map(document => ({ insertOne: { document } })))
    );

    // wait for them all
    await Promise.all(promises);
};

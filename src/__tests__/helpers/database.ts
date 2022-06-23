import { EJSON } from 'bson';
import { ObjectId, Collection } from 'mongodb';
import { getDatabaseContext, migrate, Collections } from '../../server/database';
import { getSessionToken } from '../../server/schema/session';

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

type ConvertedType<T> = T extends Date
    ? { $date: string }
    : T extends ObjectId
    ? { $oid: string }
    : T extends object
    ? { [K in keyof T]: ConvertedType<T[K]> }
    : T;

export type Fixtures = Partial<{
    [CollectionName in keyof Collections]: Array<
        Collections[CollectionName] extends Collection<infer Schema> ? ConvertedType<Schema> : never
    >;
}>;

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

export const createSessionForUser = async (userId: ObjectId) => {
    // generate a session ID
    const sessionId = new ObjectId();

    // create token
    const data = await getSessionToken({ sessionId, userId });

    // create session in database as well
    const { collections } = await getDatabaseContext();
    await collections.userSessions.insertOne({
        _id: sessionId,
        userId,
        userAgent: '',
        expiresAt: data.exp,
        createdAt: data.iat,
        lastActivityAt: data.iat,
    });

    return data;
};

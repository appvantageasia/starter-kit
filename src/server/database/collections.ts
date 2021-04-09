import { Collection, Db } from 'mongodb';
import * as documents from './documents';

export type Collections = {
    users: Collection<documents.User>;
    topics: Collection<documents.Topic>;
    headlines: Collection<documents.Headline>;
};

export const getCollections = (db: Db): Collections => ({
    users: db.collection<documents.User>('users'),
    topics: db.collection<documents.Topic>('topics'),
    headlines: db.collection<documents.Headline>('headlines'),
});

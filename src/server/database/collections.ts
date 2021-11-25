import { Collection } from 'mongodb';
import * as documents from './documents';
import { DatabaseContext } from './instance';

export type Collections = {
    users: Collection<documents.User>;
    topics: Collection<documents.Topic>;
    settings: Collection<documents.Setting>;
};

export const getCollections = ({
    regular,
    encrypted,
}: Pick<DatabaseContext, 'regular' | 'encrypted'>): Collections => ({
    users: regular.db.collection<documents.User>('users'),
    topics: regular.db.collection<documents.Topic>('topics'),
    settings: encrypted.db.collection<documents.Setting>('settings'),
});

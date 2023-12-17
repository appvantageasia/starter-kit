import { Collection } from 'mongodb';
import * as documents from './documents';
import { DatabaseContext } from './instance';

export type Collections = {
    users: Collection<documents.User>;
    userSessions: Collection<documents.UserSession>;
    userWebCredentials: Collection<documents.UserWebCredential>;
    externalLinks: Collection<documents.ExternalLink>;
    settings: Collection<documents.Setting>;
    life: Collection<documents.Life>;
};

export const getCollections = ({
    regular,
    encrypted,
}: Pick<DatabaseContext, 'regular' | 'encrypted'>): Collections => ({
    users: regular.db.collection<documents.User>('users'),
    userSessions: regular.db.collection<documents.UserSession>('userSessions'),
    userWebCredentials: regular.db.collection<documents.UserWebCredential>('userWebCredentials'),
    settings: encrypted.db.collection<documents.Setting>('settings'),
    externalLinks: regular.db.collection<documents.ExternalLink>('externalLinks'),
    life: regular.db.collection<documents.Life>('life'),
});

import { DatabaseContext } from '../instance';
import initialMigrationsIndexes from './01_initialMigrationsIndexes';
import initialUsersIndexes from './02_initialUsersIndexes';
import initialUser from './03_initialUser';
import initialExternalLinkIndexes from './04_initialExternalLinkIndexes';
import initialUserSessionIndexes from './05_initialUserSessionIndexes';
import initialUserWebCredentialsIndexes from './06_initialUserWebCredentialsIndexes';
import addSingleSessionMode from './07_addSingleSessionMode';

export interface Migration {
    identifier: string;
    up: (context: DatabaseContext) => Promise<void>;
    squash?: (Migration | string)[];
}

const migrations: Migration[] = [
    initialMigrationsIndexes,
    initialUsersIndexes,
    initialUser,
    initialExternalLinkIndexes,
    initialUserSessionIndexes,
    initialUserWebCredentialsIndexes,
    addSingleSessionMode,
];

export default migrations;

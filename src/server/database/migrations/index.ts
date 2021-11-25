import { DatabaseContext } from '../instance';
import initialMigrationsIndexes from './01_initialMigrationsIndexes';
import initialUsersIndexes from './02_initialUsersIndexes';

export interface Migration {
    identifier: string;
    up: (context: DatabaseContext) => Promise<void>;
    squash?: (Migration | string)[];
}

const migrations: Migration[] = [initialMigrationsIndexes, initialUsersIndexes];

export default migrations;

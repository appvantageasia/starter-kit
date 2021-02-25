import { Db } from 'mongodb';
import initialMigrationsIndexes from './01_initialMigrationsIndexes';
import initialUsersIndexes from './02_initialUsersIndexes';

export interface Migration {
    identifier: string;
    up: (db: Db) => Promise<void>;
}

const migrations: Migration[] = [initialMigrationsIndexes, initialUsersIndexes];

export default migrations;

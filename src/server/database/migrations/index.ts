import { Db } from 'mongodb';
import initialMigrationsIndexes from './01_initialMigrationsIndexes';
import initialUsersIndexes from './02_initialUsersIndexes';
import initialLivesIndexes from './03_initialLivesIndexes';

export interface Migration {
    identifier: string;
    up: (db: Db) => Promise<void>;
}

const migrations: Migration[] = [initialMigrationsIndexes, initialUsersIndexes, initialLivesIndexes];

export default migrations;

/* eslint-disable no-await-in-loop */
import chalk from 'chalk';
import { Db, ObjectId } from 'mongodb';
import { getDatabaseContext } from './instance';
import migrations, { Migration } from './migrations';

export type MigrationDocument = {
    _id: ObjectId;
    identifier: string;
    executedAt: Date;
};

export const migrate = async (db: Db, verbose = true): Promise<void> => {
    const migrationCollection = db.collection<MigrationDocument>('migrations');

    // fetch existing migrations
    const executed = await migrationCollection
        .find({})
        .map(migration => migration.identifier)
        .toArray();

    const executeMigration = (migration: Migration) => async (): Promise<void> => {
        if (executed.includes(migration.identifier)) {
            // skip it, the migration is already applied
            return;
        }

        try {
            // run the migration
            await migration.up(db);
        } catch (error) {
            // print the error
            console.error(chalk.red(`Failed to execute ${migration.identifier}`));
            // throw it back
            throw error;
        }

        // persist the run
        await migrationCollection.insertOne({
            _id: new ObjectId(),
            identifier: migration.identifier,
            executedAt: new Date(),
        });

        if (verbose) {
            console.info(chalk.blueBright(`${migration.identifier} executed`));
        }
    };

    return migrations.reduce((promise, migration) => promise.then(executeMigration(migration)), Promise.resolve());
};

export const listPendingMigrations = async (): Promise<string[]> => {
    const { db } = await getDatabaseContext();
    const migrationCollection = db.collection<MigrationDocument>('migrations');

    // fetch existing migrations
    const executed = await migrationCollection
        .find({})
        .map(migration => migration.identifier)
        .toArray();

    return migrations
        .filter(migration => !executed.includes(migration.identifier))
        .map(migration => migration.identifier);
};

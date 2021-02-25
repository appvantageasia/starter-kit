import chalk from 'chalk';
import { runValidityChecks } from './config';
import createWebServer from './createWebServer';
import { getDatabaseContext, migrate } from './database';
import { setup as startWorker } from './queues';

runValidityChecks();

const executeDataMigration = async (): Promise<void> => {
    // get the database connection
    const { db } = await getDatabaseContext();

    try {
        // then migrate the database
        await migrate(db);
    } catch (error) {
        // print it
        console.error(error);
        // and exit on status 1
        process.exit(1);
    }

    console.info(chalk.greenBright('Migration completed'));

    // and properly exit
    process.exit(0);
};

export { createWebServer, startWorker, executeDataMigration };

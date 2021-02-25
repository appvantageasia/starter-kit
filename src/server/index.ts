import chalk from 'chalk';
import { program } from 'commander';
import config, { runValidityChecks } from './config';
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

program.version(config.version);

program.command('migrate').description('Execute data migration').action(executeDataMigration);

program
    .command('worker')
    .description('Start worker')
    .action(() => {
        startWorker();
    });

program
    .command('serve')
    .description('Start web server')
    .action(() => {
        createWebServer().httpServer.listen(3000, () => {
            console.info(chalk.cyan('Server listening'));
        });
    });

if (process.isCLI) {
    program.parse();
}

export { createWebServer, startWorker, executeDataMigration };

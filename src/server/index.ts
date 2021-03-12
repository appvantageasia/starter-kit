import chalk from 'chalk';
import { program } from 'commander';
import config, { runValidityChecks } from './config';
import createWebServer from './createWebServer';
import { getDatabaseContext, migrate, listPendingMigrations } from './database';
import { setup as startWorker } from './queues';
import { initializeSentry } from './sentry';

runValidityChecks();

const executeDataMigration = async (exitOnTermination = false): Promise<void> => {
    // get the database connection
    const { db } = await getDatabaseContext();

    try {
        // then migrate the database
        await migrate(db);
    } catch (error) {
        // print it
        console.error(error);

        if (exitOnTermination) {
            // and exit on status 1
            process.exit(1);

            return;
        }

        // throw it back
        throw error;
    }

    console.info(chalk.greenBright('Migration completed'));

    if (exitOnTermination) {
        // and properly exit
        process.exit(0);
    }
};

program.version(config.version);

program
    .command('migrate')
    .description('Execute data migration')
    .action(() => executeDataMigration(true));

program
    .command('worker')
    .description('Start worker')
    .action(() => {
        initializeSentry();
        const stopWorker = startWorker();

        let stopPromise: Promise<void> | null = null;

        const onExit = () => {
            if (!stopPromise) {
                stopPromise = stopWorker()
                    .then(() => {
                        process.exit(0);
                    })
                    .catch(error => {
                        console.error(error);
                        process.exit(1);
                    });
            }
        };

        process.on('SIGTERM', onExit);
        process.on('SIGINT', onExit);
    });

program
    .command('serve')
    .description('Start web server')
    .action(() => {
        const { httpServer, expressServer } = createWebServer();

        initializeSentry({ app: expressServer });

        httpServer.listen(config.port, () => {
            console.info(chalk.cyan('Server listening'));
        });

        const onExit = () => {
            httpServer.close(() => {
                process.exit(0);
            });
        };

        process.on('SIGTERM', onExit);
        process.on('SIGINT', onExit);
    });

if (process.isCLI) {
    program.parse();
}

export { createWebServer, startWorker, executeDataMigration, listPendingMigrations };

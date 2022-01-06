import chalk from 'chalk';
import { getDatabaseContext, migrate } from '../database';
import { setup as startWorker } from '../queues';
import config from './config';
import createWebServer from './createWebServer';
import { updateStatus, HealthStatus } from './health';
import { initializeSentry } from './sentry';

export const startServerCommand = async () => {
    const { httpServer, expressServer } = await createWebServer();

    initializeSentry({ app: expressServer });

    httpServer.listen(config.port, () => {
        updateStatus(HealthStatus.Running);
        console.info(chalk.cyan('Server listening'));
    });

    return () => {
        updateStatus(HealthStatus.Stopping);

        return new Promise(resolve => {
            setTimeout(() => {
                httpServer.close(resolve);
            }, 10000);
        }).then(() => updateStatus(HealthStatus.Stopped));
    };
};

export const startWorkerCommand = () => {
    initializeSentry();

    const stopWorker = startWorker();

    let stopPromise: Promise<void> | null = null;

    return () => {
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

        return stopPromise;
    };
};

export const executeDataMigration = async (exitOnTermination = false): Promise<void> => {
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

export const composeCommand = (...shutdowns: (() => Promise<unknown>)[]) => {
    const onExit = () => {
        Promise.all(shutdowns.map(shutdown => shutdown())).then(() => process.exit(0));
    };

    process.on('SIGTERM', onExit);
    process.on('SIGINT', onExit);
};

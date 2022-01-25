import chalk from 'chalk';
import { getDatabaseContext, migrate } from '../database';
import setupMasterKey from '../database/setupMasterKey';
import { setup as startWorker } from '../queues';
import { startBoard as startBullBoard } from './bullBoard';
import config from './config';
import createWebServer from './createWebServer';
import { HealthStatus, HealthStatusManager } from './health';
import { initializeSentry } from './sentry';

export const startBullBoardCommand = (manager: HealthStatusManager) => {
    // update status
    manager.update(HealthStatus.Running);

    // get http server running
    const httpServer = startBullBoard();

    return () => {
        // update status
        manager.update(HealthStatus.Stopping);

        // close server
        return new Promise(resolve => {
            setTimeout(() => {
                httpServer.close(resolve);
            }, 1000);
        }).then(() => manager.update(HealthStatus.Stopped));
    };
};

export const startServerCommand = async (manager: HealthStatusManager) => {
    const { httpServer, expressServer } = await createWebServer();

    initializeSentry({ app: expressServer });

    httpServer.listen(config.port, () => {
        manager.update(HealthStatus.Running);
        console.info(chalk.cyan('MSG Server listening'));
    });

    return () => {
        manager.update(HealthStatus.Stopping);

        return new Promise(resolve => {
            setTimeout(() => {
                httpServer.close(resolve);
            }, 1000);
        }).then(() => manager.update(HealthStatus.Stopped));
    };
};

export const startWorkerCommand = (manager: HealthStatusManager) => {
    initializeSentry();

    // start workers
    const stopWorker = startWorker();
    // update status
    manager.update(HealthStatus.Running);

    let stopPromise: Promise<unknown> | null = null;

    return () => {
        // update status
        manager.update(HealthStatus.Stopping);

        if (!stopPromise) {
            stopPromise = stopWorker()
                .then(() => {
                    manager.update(HealthStatus.Stopped);
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
    const context = await getDatabaseContext();

    try {
        // then migrate the database
        await migrate(context);
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

export const executeSetupMasterKey = async () => {
    try {
        await setupMasterKey();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

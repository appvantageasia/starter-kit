import { program } from 'commander';
import {
    composeCommand,
    executeDataMigration,
    startServerCommand,
    startWorkerCommand,
    startBullBoardCommand,
    executeSetupMasterKey,
} from './core/commands';
import config, { runValidityChecks } from './core/config';
import createWebServer from './core/createWebServer';
import { HealthStatusManager, createHealthServer } from './core/health';
import { startPrometheusServer } from './core/prometheus';
import { listPendingMigrations } from './database';
import { setup as startWorker } from './queues';

runValidityChecks();

program.version(config.version);

program
    .command('migrate')
    .description('Execute data migration')
    .action(() => executeDataMigration(true));

program
    .command('worker')
    .description('Start worker')
    .action(() => {
        const manager = new HealthStatusManager();
        createHealthServer(manager);
        composeCommand(startWorkerCommand(manager));
    });

program
    .command('serve')
    .description('Start web server')
    .action(async () => {
        const manager = new HealthStatusManager();
        createHealthServer(manager);
        composeCommand(await startServerCommand(manager), await startPrometheusServer());
    });

program
    .command('bullBoard')
    .description('Start bull board')
    .action(async () => {
        const manager = new HealthStatusManager();
        createHealthServer(manager);
        composeCommand(startBullBoardCommand(manager));
    });

program.command('setupMasterKey').description('Setup master key for MongoDB CSFLE').action(executeSetupMasterKey);

if (process.isCLI) {
    program.parse();
}

const bundle = { createWebServer, startWorker, executeDataMigration, listPendingMigrations };

export default bundle;

export type Bundle = typeof bundle;

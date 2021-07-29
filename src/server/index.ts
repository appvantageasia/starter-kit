import { program } from 'commander';
import { composeCommand, executeDataMigration, startServerCommand, startWorkerCommand } from './core/commands';
import config, { runValidityChecks } from './core/config';
import createWebServer from './core/createWebServer';
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
        composeCommand(startWorkerCommand());
    });

program
    .command('serve')
    .description('Start web server')
    .action(async () => {
        composeCommand(await startServerCommand(), await startPrometheusServer());
    });

if (process.isCLI) {
    program.parse();
}

export { createWebServer, startWorker, executeDataMigration, listPendingMigrations };

import { program } from 'commander';
import { composeCommand, executeDataMigration, startServerCommand, startWorkerCommand } from './core/commands';
import config, { runValidityChecks } from './core/config';
import createWebServer, { createHealthServer } from './core/createWebServer';
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
        composeCommand(startWorkerCommand(true));
    });

program
    .command('serve')
    .description('Start web server')
    .action(async () => {
        const services = [await startServerCommand(), await startPrometheusServer()];

        if (config.healthChecks.enabled && config.healthChecks.port !== config.port) {
            services.push(createHealthServer());
        }

        composeCommand(...services);
    });

if (process.isCLI) {
    program.parse();
}

export { createWebServer, startWorker, executeDataMigration, listPendingMigrations };

const Enquirer = require('enquirer');

class MigrationRunner {
    constructor() {
        this.enquirer = new Enquirer();
        this.migrationPromise = null;

        this.latestPrompt = null;

        this.enquirer.on('prompt', prompt => {
            this.latestPrompt = prompt;
        });
    }

    async start({ listPendingMigrations, executeDataMigration }, isOutdated) {
        const pendingMigrations = await listPendingMigrations();

        if (isOutdated() || pendingMigrations.length === 0) {
            return;
        }

        const { doExecute } = await this.enquirer.prompt({
            type: 'confirm',
            name: 'doExecute',
            message: `${pendingMigrations.length} migrations pending, execute now ?`,
        });

        this.latestPrompt = null;

        if (isOutdated() || !doExecute) {
            return;
        }

        this.migrationPromise = executeDataMigration();

        try {
            await this.migrationPromise;
        } finally {
            this.migrationPromise = null;
        }
    }

    async stop() {
        if (this.latestPrompt) {
            try {
                await this.latestPrompt.close();
            } finally {
                this.latestPrompt = null;
            }
        }

        if (this.migrationPromise) {
            try {
                // wait for it to be done
                await this.migrationPromise;
            } catch (error) {
                // ignore it
            }
        }
    }
}

module.exports = MigrationRunner;

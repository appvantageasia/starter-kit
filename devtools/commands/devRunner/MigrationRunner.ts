import Enquirer, { Prompt } from 'enquirer';
import { BundleEntry } from './index';

export default class MigrationRunner {
    private enquirer: Enquirer<{ doExecute: boolean }>;

    private latestPrompt: Prompt | null;

    private migrationPromise: Promise<void>;

    constructor() {
        this.enquirer = new Enquirer();
        this.migrationPromise = null;
        this.latestPrompt = null;

        this.enquirer.on('prompt', prompt => {
            this.latestPrompt = prompt;
        });
    }

    async start({ listPendingMigrations, executeDataMigration }: BundleEntry, isOutdated) {
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
                // todo look into it
                // @ts-ignore
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

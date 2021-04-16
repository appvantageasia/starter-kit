/// <reference types="cypress" />
import fs from 'fs';
import path from 'path';
import loadEnvConfig from '../../devtools/env';
import { cleanDatabase, setupDatabase, loadFixtures } from '../../src/__tests__/helpers/database';
import PluginEvents = Cypress.PluginEvents;
import PluginConfigOptions = Cypress.PluginConfigOptions;

const cypressDir = path.resolve(__dirname, '..');
const fixtureDir = path.resolve(cypressDir, 'fixtures');
const rootDir = path.resolve(cypressDir, '..');

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on: PluginEvents, config: PluginConfigOptions) => {
    // setup the environment
    loadEnvConfig(rootDir, true, true);

    on('task', {
        async setupDatabase(fixtures = []) {
            await cleanDatabase();
            await setupDatabase();

            if (fixtures.length) {
                const data = fixtures.map(name => {
                    const fixturePath = path.resolve(fixtureDir, `${name}.json`);

                    if (!fs.existsSync(fixturePath)) {
                        throw new Error(`Fixture "${name}" not found`);
                    }

                    const raw = fs.readFileSync(fixturePath, 'utf8');

                    return JSON.parse(raw);
                });

                await loadFixtures(data);
            }
        },
    });
};

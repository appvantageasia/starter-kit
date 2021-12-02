/* eslint-disable import/no-import-module-exports */
/// <reference types="cypress" />
import fs from 'fs';
import path from 'path';
import loadEnvConfig from '../../devtools/env';
import PluginEvents = Cypress.PluginEvents;
import PluginConfigOptions = Cypress.PluginConfigOptions;

const cypressDir = path.resolve(__dirname, '..');
const fixtureDir = path.resolve(cypressDir, 'fixtures');
const rootDir = path.resolve(cypressDir, '..');

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on: PluginEvents, config: PluginConfigOptions) => {
    if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'test';
    }

    // setup the environment
    loadEnvConfig(rootDir, true, true);

    // then get helpers
    // eslint-disable-next-line global-require
    const { cleanDatabase, setupDatabase, loadFixtures } = require('../../src/__tests__/helpers/database');

    on('task', {
        async setupDatabase(fixtures = []) {
            await cleanDatabase();
            await setupDatabase();

            if (fixtures.length) {
                await fixtures.reduce((promise, name) => {
                    const fixturePath = path.resolve(fixtureDir, `${name}.json`);

                    if (!fs.existsSync(fixturePath)) {
                        throw new Error(`Fixture "${name}" not found`);
                    }

                    const raw = fs.readFileSync(fixturePath, 'utf8');
                    const data = JSON.parse(raw);

                    return promise.then(() => loadFixtures(data)());
                }, Promise.resolve());
            }

            return true;
        },
    });
};

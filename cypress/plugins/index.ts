/// <reference types="cypress" />
import fs from 'fs';
import path from 'path';
import { cleanDatabase, setupDatabase, loadFixtures, Fixtures } from '../../src/__tests__/helpers/database';

const cypressDir = path.resolve(__dirname, '..');
const fixtureDir = path.resolve(cypressDir, 'fixtures');

const pluginConfig: Cypress.PluginConfig = (on, config) => {
    on('task', {
        async setupDatabase(fixtures: Fixtures[] = []) {
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

export default pluginConfig;

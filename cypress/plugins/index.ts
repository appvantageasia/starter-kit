/// <reference types="cypress" />
import path from 'path';
import loadEnvConfig from '../../devtools/env';

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
    const dir = path.resolve(__dirname, '../..');

    loadEnvConfig(dir, true, true);
};

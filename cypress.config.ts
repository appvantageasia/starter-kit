import { defineConfig } from 'cypress';
import urlJoin from 'url-join';
import loadEnvConfig from './devtools/env';
import webpackConfig from './devtools/webpack/cypress';

const setupEnvironment = () => {
    if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'test';
    }

    // setup the environment
    loadEnvConfig(__dirname, true, true);
};

const baseUrl = process.env.CYPRESS_BASE_URL || 'http://localhost:3000';

export default defineConfig({
    e2e: {
        // this can always be override with environment variable
        baseUrl,

        env: {
            codeCoverage: {
                url: urlJoin(baseUrl, '/__coverage__'),
            },
        },

        setupNodeEvents(on, config) {
            setupEnvironment();

            // eslint-disable-next-line global-require
            require('@cypress/code-coverage/task')(on, config);

            // eslint-disable-next-line global-require
            require('./cypress/plugins').default(on, config);

            return config;
        },
    },

    component: {
        devServer: {
            framework: 'react',
            bundler: 'webpack',
            webpackConfig,
        },

        setupNodeEvents(on, config) {
            // eslint-disable-next-line global-require
            require('@cypress/code-coverage/task')(on, config);

            return config;
        },
    },
});

import { defineConfig } from 'cypress';
import webpackConfig from './devtools/webpack/cypress';

export default defineConfig({
    e2e: {
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        setupNodeEvents(on, config) {
            // eslint-disable-next-line global-require
            return require('./cypress/plugins')(on, config);
        },
    },

    component: {
        devServer: {
            framework: 'react',
            bundler: 'webpack',
            webpackConfig,
        },
    },
});

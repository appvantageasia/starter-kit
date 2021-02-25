/* eslint-disable import/no-extraneous-dependencies */
import '@testing-library/jest-dom';
import loadEnvConfig from './devtools/env';

// load environment
loadEnvConfig(__dirname, true, false);

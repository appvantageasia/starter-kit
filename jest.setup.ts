/* eslint-env jest */
/* eslint-disable import/no-extraneous-dependencies */
import '@testing-library/jest-dom';
import loadEnvConfig from './devtools/env';
import { stopAllQueues } from './src/server/queues';

// load environment
loadEnvConfig(__dirname, true, false);

afterAll(async () => {
    // stop bull queues
    await stopAllQueues();

    if (global.redis) {
        // disconnect redis
        global.redis.disconnect();
        global.redis = undefined;
    }
});

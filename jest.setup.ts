/* eslint-env jest */
/* eslint-disable import/no-extraneous-dependencies */
import '@testing-library/jest-dom';
import loadEnvConfig from './devtools/env';

// load environment
loadEnvConfig(__dirname, true, false);

afterAll(async () => {
    // eslint-disable-next-line global-require
    const { stopAllQueues } = require('./src/__tests__/helpers');
    await stopAllQueues();

    if (global.redis) {
        // disconnect redis
        global.redis.disconnect();
        global.redis = undefined;
    }

    if (global.pubSub) {
        global.pubSub.close();
        global.pubSub = undefined;
    }
});

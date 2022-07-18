import { createHash } from 'crypto';
import path from 'path';
import { Configuration } from 'webpack';
import { isBuildIntentProduction, webpackCacheMode, webpackCacheDirectory, rootDirname } from './variables';

const createEnvironmentHash = (env: string) => {
    const hash = createHash('md5');
    hash.update(JSON.stringify(env));

    return hash.digest('hex');
};

const getCache = (env: string): Configuration['cache'] => {
    if (isBuildIntentProduction) {
        return false;
    }

    if (webpackCacheMode === 'memory') {
        return { type: 'memory' };
    }

    if (webpackCacheMode === 'filesystem') {
        return {
            type: 'filesystem',
            version: createEnvironmentHash(env),
            cacheDirectory: webpackCacheDirectory,
            store: 'pack',
            buildDependencies: {
                defaultWebpack: ['webpack/lib/'],
                config: [path.join(__dirname, '/')],
                tsconfig: [path.join(rootDirname, 'tsconfig.json')],
            },
        };
    }

    throw new Error('Unknown cache mode');
};

export default getCache;

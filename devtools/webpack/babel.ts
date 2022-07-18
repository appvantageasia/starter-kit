import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { RuleSetRule } from 'webpack';
import { isBuildIntentDevelopment, rootDirname, webpackCacheDirectory } from './variables';

const getBabelRule = (isServer = false): RuleSetRule => {
    const useReactRefresh = isBuildIntentDevelopment && !isServer;
    const useIstanbul = !!process.env.USE_ISTANBUL || false;

    const presetOptions = {
        isServer,
        hasReactRefresh: useReactRefresh,
        hasJsxRuntime: true,
        development: isBuildIntentDevelopment,
    };

    if (useIstanbul) {
        console.info(chalk.yellowBright('Istanbul running in babel for instrumentation'));
    }

    const hashSum = crypto.createHash('sha256');
    hashSum.update(fs.readFileSync(path.join(rootDirname, 'yarn.lock'), 'utf8'));

    const cache = isBuildIntentDevelopment
        ? {
              cacheIdentifier: hashSum.digest('hex'),
              cacheDirectory: path.join(webpackCacheDirectory, 'babel-loader'),
              cacheCompression: false,
          }
        : {};

    return {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
            {
                loader: require.resolve('babel-loader'),
                options: {
                    babelrc: false,
                    presets: [[require.resolve('../babel'), presetOptions]],
                    plugins: [
                        // as we globally import ant design less stylesheet, we want to remove style with babel
                        // that does help to remove conflicts when using mini-css-extractor
                        ['import', { libraryName: 'antd' }, 'antd'],
                        // finally, support react-refresh on the web application when running development server
                        useReactRefresh && require.resolve('react-refresh/babel'),
                        // we may also want to include istanbul on the web applications
                        // may be used together with cypress to retrieve code coverage
                        useIstanbul && 'istanbul',
                    ].filter(Boolean),

                    // setup caching to speed up performances
                    ...cache,

                    // Babel sourcemaps are needed for debugging into node_modules
                    // code.  Without the options below, debuggers like VSCode
                    // show incorrect code and set breakpoints on the wrong lines.
                    sourceMaps: true,
                    inputSourceMap: true,
                },
            },
        ],
    };
};

export default getBabelRule;

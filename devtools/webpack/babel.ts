import chalk from 'chalk';
import { RuleSetRule } from 'webpack';
import { isBuildIntentDevelopment } from './variables';

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
                },
            },
        ],
    };
};

export default getBabelRule;

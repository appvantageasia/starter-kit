import { RuleSetRule } from 'webpack';
import { isBuildIntentDevelopment } from './variables';

const getBabelRule = (isServer = false): RuleSetRule => {
    const presetOptions = {
        isServer,
        hasReactRefresh: !isServer,
        hasJsxRuntime: true,
        development: isBuildIntentDevelopment,
    };

    const useReactRefresh = isBuildIntentDevelopment && !isServer;

    return {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
            {
                loader: require.resolve('babel-loader'),
                options: {
                    babelrc: false,
                    presets: [[require.resolve('../babel'), presetOptions]],
                    plugins: [useReactRefresh && require.resolve('react-refresh/babel')].filter(Boolean),
                },
            },
        ],
    };
};

export default getBabelRule;

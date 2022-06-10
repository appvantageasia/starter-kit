import { RuleSetRule } from 'webpack';
import { isBuildIntentDevelopment } from './variables';

const getBabelRule = (isServer = false): RuleSetRule => {
    const presetOptions = {
        isServer,
        hasReactRefresh: !isServer,
        hasJsxRuntime: true,
        development: isBuildIntentDevelopment,
    };

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
                        isBuildIntentDevelopment && !isServer && require.resolve('react-refresh/babel'),
                    ].filter(Boolean),
                },
            },
        ],
    };
};

export default getBabelRule;

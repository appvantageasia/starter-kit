const { isBuildIntentDevelopment } = require('./variables.cjs');

const getBabelRule = (isServer = false) => {
    const presetOptions = {
        isServer,
        hasReactRefresh: !isServer,
        hasJsxRuntime: true,
        development: isBuildIntentDevelopment,
    };

    return {
        test: /\.[jt]sx?$/,
        exclude: /node_modules|\.yarn/,
        use: [
            {
                loader: require.resolve('babel-loader'),
                options: {
                    babelrc: false,
                    presets: [[require.resolve('../babel.cjs'), presetOptions]],
                    plugins: [isBuildIntentDevelopment && !isServer && require.resolve('react-refresh/babel')].filter(
                        Boolean
                    ),
                },
            },
        ],
    };
};

module.exports = getBabelRule;

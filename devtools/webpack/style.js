const { isBuildIntentProduction } = require('./variables');

const getCSSRules = (esModule = false) => {
    const options = esModule
        ? {
              esModule: true,
              modules: {
                  namedExport: true,
              },
          }
        : null;

    return [
        { loader: require.resolve('style-loader'), options },
        {
            loader: require.resolve('css-loader'),
            options: {
                ...options,
                sourceMap: isBuildIntentProduction,
            },
        },
    ];
};

const getLessRules = (esModule = false) => [
    ...getCSSRules(esModule),
    {
        loader: require.resolve('less-loader'),
        options: {
            // required for ant design
            javascriptEnabled: true,
            sourceMap: isBuildIntentProduction,
        },
    },
];

const getStyleRule = () => {
    return undefined;

    return {
        test: /\.(less|css)$/,
        oneOf: [
            {
                test: /\.module.css$/,
                use: getCSSRules(true),
            },
            {
                test: /\.css$/,
                use: getCSSRules(),
            },
            {
                test: /\.module.less$/,
                use: getLessRules(true),
            },
            {
                test: /\.less$/,
                use: getLessRules(),
            },
        ],
    };
};

module.exports = getStyleRule;

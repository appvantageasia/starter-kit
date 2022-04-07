const { dirname } = require('path');

const isLoadIntentTest = process.env.NODE_ENV === 'test';
const isLoadIntentDevelopment = process.env.NODE_ENV === 'development';

module.exports = (api, options = {}) => {
    const supportsESM = api.caller(caller => !!caller?.supportsStaticESM);
    const isServer = api.caller(caller => caller?.target === 'node');
    const isCallerDevelopment = api.caller(caller => caller?.isDev);

    // Look at external intent if used without a caller (e.g. via Jest):
    const isTest = isCallerDevelopment == null && isLoadIntentTest;

    // Look at external intent if used without a caller (e.g. Storybook):
    const isDevelopment = isCallerDevelopment === true || (isCallerDevelopment == null && isLoadIntentDevelopment);

    // Default to production mode if not `test` nor `development`:
    const isProduction = !(isTest || isDevelopment);

    const isBabelLoader = api.caller(caller => !!caller && caller.name === 'babel-loader');

    const useJsxRuntime = options['preset-react']?.runtime === 'automatic' || Boolean(options.hasJsxRuntime);

    const presetEnvConfig = {
        // In the test environment `modules` is often needed to be set to true,
        // babel figures that out by itself using the `'auto'` option
        // In production/development this option is set to `false`
        // so that webpack can handle import/export with tree-shaking
        modules: 'auto',
        exclude: ['transform-typeof-symbol'],
        include: ['@babel/plugin-proposal-optional-chaining', '@babel/plugin-proposal-nullish-coalescing-operator'],
        ...options['preset-env'],
    };

    // When transpiling for the server or tests, target the current Node version
    // if not explicitly specified:
    if (
        (isServer || isTest) &&
        (!presetEnvConfig.targets ||
            !(typeof presetEnvConfig.targets === 'object' && 'node' in presetEnvConfig.targets))
    ) {
        presetEnvConfig.targets = {
            // Targets the current process' version of Node. This requires apps be
            // built and deployed on the same version of Node.
            node: 'current',
        };
    }

    return {
        sourceType: 'unambiguous',
        presets: [
            [require.resolve('@babel/preset-env'), presetEnvConfig],
            [
                require.resolve('@babel/preset-react'),
                {
                    // This adds @babel/plugin-transform-react-jsx-source and
                    // @babel/plugin-transform-react-jsx-self automatically in development
                    development: isDevelopment || isTest,
                    ...(useJsxRuntime ? { runtime: 'automatic' } : { pragma: '__jsx' }),
                    ...options['preset-react'],
                },
            ],
            [require.resolve('@babel/preset-typescript'), { allowNamespaces: true, ...options['preset-typescript'] }],
        ],
        plugins: [
            [
                require.resolve('babel-plugin-styled-components'),
                {
                    ssr: true,
                },
            ],
            [
                require.resolve('babel-plugin-import'),
                {
                    libraryName: 'antd',
                    style: !isServer,
                    css: !isServer,
                },
            ],
            !useJsxRuntime && [
                require.resolve('@babel/plugin-transform-react-jsx'),
                {
                    module: 'react',
                    importAs: 'React',
                    pragma: '__jsx',
                    property: 'createElement',
                },
            ],
            require.resolve('@babel/plugin-syntax-dynamic-import'),
            [require.resolve('@babel/plugin-proposal-class-properties'), options['class-properties'] || {}],
            [
                require.resolve('@babel/plugin-proposal-object-rest-spread'),
                {
                    useBuiltIns: true,
                },
            ],
            !isServer && [
                require.resolve('@babel/plugin-transform-runtime'),
                {
                    corejs: false,
                    helpers: true,
                    regenerator: true,
                    useESModules: supportsESM && presetEnvConfig.modules !== 'commonjs',
                    absoluteRuntime: isBabelLoader
                        ? dirname(require.resolve('@babel/runtime/package.json'))
                        : undefined,
                    ...options['transform-runtime'],
                },
            ],
            isProduction && [
                require.resolve('babel-plugin-transform-react-remove-prop-types'),
                {
                    removeImport: true,
                },
            ],
            // Always compile numeric separator because the resulting number is
            // smaller.
            require.resolve('@babel/plugin-proposal-numeric-separator'),
            require.resolve('@babel/plugin-transform-modules-commonjs'),
        ].filter(Boolean),
    };
};

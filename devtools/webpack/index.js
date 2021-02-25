const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const nodeExternals = require('webpack-node-externals');
const PackagePlugin = require('./WebpackPackagePlugin');
const getBabelRule = require('./babel');
const getStyleRule = require('./style');

const {
    webpackMode,
    srcDirname,
    rootDirname,
    isBuildIntentDevelopment,
    isBuildIntentProduction,
} = require('./variables');

const graphqlRule = {
    test: /\.graphql$/,
    exclude: /node_modules/,
    loader: require.resolve('graphql-tag/loader'),
};

const serverConfig = {
    name: 'server',
    mode: webpackMode,

    target: 'node',

    entry: {
        server: [
            path.resolve(srcDirname, 'server/node-fetch-polyfill.js'),
            path.resolve(srcDirname, 'server/index.ts'),
        ],
    },

    resolve: {
        extensions: ['.js', '.mjs', '.tsx', '.ts', '.jsx', '.json', '.wasm'],
        mainFields: ['main', 'module'],
    },

    externals: ['./manifest.json', nodeExternals()],

    output: {
        path: path.resolve(rootDirname, 'build'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        chunkFilename: isBuildIntentDevelopment ? '[name].js' : '[name].[contenthash].js',
    },

    // do not show performance hints
    performance: false,

    bail: isBuildIntentProduction,
    devtool: isBuildIntentProduction ? 'source-map' : 'cheap-module-source-map',

    module: {
        rules: [
            { test: /antd\/.*?\/style.*?/, use: require.resolve('null-loader') },
            getBabelRule(isBuildIntentDevelopment),
            graphqlRule,
        ].filter(Boolean),
    },

    plugins: [
        new webpack.BannerPlugin({
            banner: 'process.isCLI = require.main === module;',
            entryOnly: true,
            raw: true,
        }),

        new webpack.DefinePlugin({
            'process.browser': JSON.stringify(false),
            'process.isDev': JSON.stringify(isBuildIntentDevelopment),
        }),

        // provide a package.json on production
        isBuildIntentProduction &&
            new PackagePlugin({
                yarnFile: path.resolve(rootDirname, './yarn.lock'),
            }),
    ].filter(Boolean),
};

const appConfig = {
    name: 'app',
    mode: webpackMode,

    target: `browserslist:${webpackMode}`,

    entry: {
        app: [
            isBuildIntentDevelopment && require.resolve('webpack-hot-middleware/client'),
            require.resolve('antd/dist/antd.less'),
            path.resolve(srcDirname, 'app/index.tsx'),
        ].filter(Boolean),
    },

    resolve: {
        extensions: ['.js', '.mjs', '.tsx', '.ts', '.jsx', '.json', '.wasm'],
        mainFields: ['browser', 'module', 'main'],
    },

    output: {
        publicPath: '/public/',
        path: path.resolve(rootDirname, 'build/public'),
        filename: isBuildIntentDevelopment ? 'static/chunks/[name].js' : 'static/chunks/[name]-[chunkhash].js',
        chunkFilename: isBuildIntentDevelopment ? 'static/chunks/[name].js' : 'static/chunks/[name]-[chunkhash].js',
        library: '_N_E',
        libraryTarget: 'assign',
        hotUpdateChunkFilename: 'static/webpack/[id].[fullhash].hot-update.js',
        hotUpdateMainFilename: 'static/webpack/[fullhash].hot-update.json',
    },

    // do not show performance hints
    performance: false,

    bail: isBuildIntentProduction,
    devtool: isBuildIntentProduction ? 'source-map' : 'cheap-module-source-map',

    module: {
        rules: [getBabelRule(true), getStyleRule(), graphqlRule].filter(Boolean),
    },

    plugins: [
        new WebpackManifestPlugin({
            fileName: path.join(rootDirname, 'build', 'manifest.json'),
            writeToFileEmit: true,
            generate: (seed, files) =>
                files.reduce((manifest, file) => {
                    if (!file.isInitial) {
                        return manifest;
                    }

                    let assetType = null;

                    if (file.path.match(/\.js$/)) {
                        assetType = 'js';
                    } else if (file.path.match(/\.css$/)) {
                        assetType = 'css';
                    }

                    if (!assetType) {
                        return manifest;
                    }

                    if (!manifest[file.chunk.name]) {
                        // eslint-disable-next-line no-param-reassign
                        manifest[file.chunk.name] = { js: [], css: [] };
                    }

                    manifest[file.chunk.name][assetType].push(file.path);

                    return manifest;
                }, {}),
        }),

        new webpack.DefinePlugin({
            'process.browser': JSON.stringify(true),
            'process.isDev': JSON.stringify(isBuildIntentDevelopment),
        }),

        new CopyPlugin({
            patterns: [{ from: path.join(rootDirname, 'public'), to: './' }],
        }),

        // hot reload with react refresh
        isBuildIntentDevelopment && new webpack.HotModuleReplacementPlugin(),
        isBuildIntentDevelopment && new ReactRefreshWebpackPlugin(),

        isBuildIntentProduction &&
            new MiniCssExtractPlugin({
                filename: 'static/css/[contenthash].css',
                chunkFilename: 'static/css/[contenthash].css',
            }),
    ].filter(Boolean),
};

module.exports = [serverConfig, appConfig];

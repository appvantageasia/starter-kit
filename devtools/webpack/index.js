const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
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

    entry: { server: [path.resolve(srcDirname, 'server/index.ts')] },

    resolve: {
        extensions: ['.js', '.mjs', '.tsx', '.ts', '.jsx', '.json', '.wasm'],
        mainFields: ['main', 'module'],
    },

    externals: [nodeExternals()],

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
        rules: [getBabelRule(isBuildIntentDevelopment), getStyleRule(), graphqlRule].filter(Boolean),
    },

    cache: {
        type: 'memory',
    },
};

const appConfig = {
    name: 'app',
    mode: webpackMode,

    target: 'browserslist',

    entry: { app: [path.resolve(srcDirname, 'app/index.ts')] },

    resolve: {
        extensions: ['.js', '.mjs', '.tsx', '.ts', '.jsx', '.json', '.wasm'],
        mainFields: ['browser', 'module', 'main'],
    },

    output: {
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
        // hot reload with react refresh
        isBuildIntentDevelopment && new webpack.HotModuleReplacementPlugin(),
        isBuildIntentDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),

    cache: {
        type: 'filesystem',
        cacheDirectory: path.resolve(rootDirname, '.cache/app'),
    },
};

module.exports = [serverConfig, appConfig];

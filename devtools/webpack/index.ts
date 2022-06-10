import path from 'path';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack, { Configuration, RuleSetRule } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import nodeExternals from 'webpack-node-externals';
import WebpackBar from 'webpackbar';
import PackagePlugin from './WebpackPackagePlugin';

import getBabelRule from './babel';
import getStyleRule from './style';

import { webpackMode, srcDirname, rootDirname, isBuildIntentDevelopment, isBuildIntentProduction } from './variables';

// is it running in an interactive shell
const isInteractive = process.stdout.isTTY;

const graphqlRule: RuleSetRule = {
    test: /\.graphql$/,
    exclude: /node_modules/,
    loader: require.resolve('graphql-tag/loader'),
};

const svgRule: RuleSetRule = {
    test: /\.svg$/,
    use: [require.resolve('@svgr/webpack')],
};

const serverConfig: Configuration = {
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
        alias: {
            '@sentry/react': '@sentry/node',
        },
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
            svgRule,
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
        isBuildIntentProduction && new PackagePlugin({}),

        // show progress bar when building for production with TTY
        isBuildIntentProduction && isInteractive && new WebpackBar({ name: 'server', profile: true }),
    ].filter(Boolean),
};

const appConfig: Configuration = {
    name: 'app',
    mode: webpackMode,

    target: `browserslist:${webpackMode}`,

    entry: {
        app: [
            isBuildIntentDevelopment && require.resolve('webpack-hot-middleware/client'),
            require.resolve('antd/dist/antd.less'),
            path.resolve(srcDirname, 'app/global.less'),
            path.resolve(srcDirname, 'app/index.tsx'),
        ].filter(Boolean),
    },

    resolve: {
        extensions: ['.js', '.mjs', '.tsx', '.ts', '.jsx', '.json', '.wasm'],
        mainFields: ['browser', 'module', 'main'],
        alias: {
            '@sentry/node': '@sentry/react',
        },
    },

    output: {
        publicPath: undefined,
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
        rules: [getBabelRule(true), getStyleRule(), graphqlRule, svgRule].filter(Boolean),
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
        isBuildIntentDevelopment &&
            new ReactRefreshWebpackPlugin({
                overlay: {
                    sockIntegration: 'whm',
                },
            }),

        new MiniCssExtractPlugin({
            filename: 'static/css/[contenthash].css',
            chunkFilename: 'static/css/[contenthash].css',
        }),

        isBuildIntentProduction &&
            new BundleAnalyzerPlugin({
                reportFilename: path.join(rootDirname, 'report.html'),
                analyzerMode: 'static',
                openAnalyzer: false,
            }),

        isBuildIntentProduction && isInteractive && new WebpackBar({ name: 'app', profile: true }),
    ].filter(Boolean),
};

export default [serverConfig, appConfig];

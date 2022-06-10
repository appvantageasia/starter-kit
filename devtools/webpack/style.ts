/* eslint-disable global-require */
import fs from 'fs';
import path from 'path';
import lessToJS from 'less-vars-to-js';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import getCSSModuleLocalIdent from 'react-dev-utils/getCSSModuleLocalIdent';
import { RuleSetRule } from 'webpack';
import { isBuildIntentProduction, srcDirname } from './variables';

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

const overrideFile = path.join(srcDirname, 'app/antd.override.less');

const getStyleLoaders = cssOptions =>
    [
        // extract the css
        { loader: MiniCssExtractPlugin.loader },
        // everything go through the css loader
        {
            loader: require.resolve('css-loader'),
            options: {
                ...cssOptions,
                sourceMap: isBuildIntentProduction,
            },
        },
    ].filter(Boolean);

const getLessLoaders = cssOptions => [
    ...getStyleLoaders(cssOptions),
    {
        loader: require.resolve('resolve-url-loader'),
        options: {
            sourceMap: isBuildIntentProduction,
        },
    },
    {
        loader: require.resolve('less-loader'),
        options: {
            lessOptions: {
                // required for ant design
                javascriptEnabled: true,
                modifyVars: lessToJS(fs.readFileSync(overrideFile, 'utf8'), {
                    stripPrefix: true,
                    resolveVariables: true,
                }),
            },
            sourceMap: isBuildIntentProduction,
        },
    },
];

const getStyleRule = (): RuleSetRule => ({
    test: /\.(less|css)$/,
    oneOf: [
        // "postcss" loader applies autoprefixer to our CSS.
        // "css" loader resolves paths in CSS and adds assets as dependencies.
        // "style" loader turns CSS into JS modules that inject <style> tags.
        // In production, we use MiniCSSExtractPlugin to extract that CSS
        // to a file, but in development "style" loader enables hot editing
        // of CSS.
        // By default we support CSS Modules with the extension .module.css
        {
            test: cssRegex,
            exclude: cssModuleRegex,
            use: getStyleLoaders({ importLoaders: 1 }),
            // Don't consider CSS imports dead code even if the
            // containing package claims to have no side effects.
            // Remove this when webpack adds a warning or an error for this.
            // See https://github.com/webpack/webpack/issues/6571
            sideEffects: true,
        },

        // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
        // using the extension .module.css
        {
            test: cssModuleRegex,
            use: getStyleLoaders({
                importLoaders: 1,
                modules: {
                    getLocalIdent: getCSSModuleLocalIdent,
                },
            }),
        },

        // Opt-in support for LESS
        // By default we support LESS Modules with the
        // extensions .module.less
        {
            test: lessRegex,
            exclude: lessModuleRegex,
            use: getLessLoaders({ importLoaders: 2 }),
            // Don't consider CSS imports dead code even if the
            // containing package claims to have no side effects.
            // Remove this when webpack adds a warning or an error for this.
            // See https://github.com/webpack/webpack/issues/6571
            sideEffects: true,
        },

        // Adds support for CSS Modules, but using LESS
        // using the extension .module.less
        {
            test: lessModuleRegex,
            use: getStyleLoaders({
                importLoaders: 2,
                modules: {
                    getLocalIdent: getCSSModuleLocalIdent,
                },
            }),
        },
    ],
});

export default getStyleRule;

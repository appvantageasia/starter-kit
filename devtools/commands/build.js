const webpack = require('webpack');
const webpackConfigs = require('../webpack');

const compiler = webpack(webpackConfigs);

compiler.run((err, stats) => {
    if (err) {
        console.error(err.stack || err);

        if (err.details) {
            console.error(err.details);
        }

        return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
        console.error(info.errors);
    }

    if (stats.hasWarnings()) {
        console.warn(info.warnings);
    }
});

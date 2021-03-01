const path = require('path');
const rimraf = require('rimraf');
const webpack = require('webpack');
const webpackConfigs = require('../webpack');
const { rootDirname } = require('../webpack/variables');

// empty build directory
rimraf.sync(path.join(rootDirname, 'build'));

const compiler = webpack(webpackConfigs);

compiler.run((err, stats) => {
    if (err) {
        console.error(err.stack || err);

        if (err.details) {
            console.error(err.details);
        }

        process.exit(1);

        return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
        console.error(info.errors);
    }

    if (stats.hasWarnings()) {
        console.warn(info.warnings);
    }

    if (stats.hasErrors() || stats.hasWarnings()) {
        process.exit(1);
    }
});

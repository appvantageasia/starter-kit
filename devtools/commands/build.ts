import path from 'path';
import rimraf from 'rimraf';
import webpack from 'webpack';
import webpackConfigs from '../webpack/index';
import { rootDirname } from '../webpack/variables';

// empty build directory
rimraf.sync(path.join(rootDirname, 'build'));

const compiler = webpack(webpackConfigs);

compiler.run((err, stats) => {
    if (err) {
        console.error(err.stack || err);
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

export {};

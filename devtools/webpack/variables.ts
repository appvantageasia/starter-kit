import path from 'path';
import { Configuration } from 'webpack';

export const isBuildIntentDevelopment = process.env.NODE_ENV === 'development';
export const isBuildIntentProduction = !isBuildIntentDevelopment;

export const rootDirname = path.resolve(__dirname, '../..');
export const srcDirname = path.join(rootDirname, './src');

export const buildDirname = path.join(rootDirname, process.env.BUILD_DIR || 'build');

export const webpackMode = isBuildIntentProduction ? 'production' : 'development';

type WebpackCacheMode = Exclude<Configuration['cache'], boolean>['type'];

export const webpackCacheMode: WebpackCacheMode = (process.env.CACHE_MODE as WebpackCacheMode) || 'memory';

export const webpackCacheDirectory = path.resolve(rootDirname, '.cache');

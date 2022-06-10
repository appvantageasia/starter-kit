import path from 'path';

const isBuildIntentDevelopment = process.env.NODE_ENV === 'development';
const isBuildIntentProduction = !isBuildIntentDevelopment;

const rootDirname = path.resolve(__dirname, '../..');
const srcDirname = path.join(rootDirname, './src');

const webpackMode = isBuildIntentProduction ? 'production' : 'development';

export { isBuildIntentDevelopment, isBuildIntentProduction, rootDirname, srcDirname, webpackMode };

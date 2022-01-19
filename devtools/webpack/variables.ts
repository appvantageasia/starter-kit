import path from 'path';

export const isBuildIntentDevelopment = process.env.NODE_ENV === 'development';
export const isBuildIntentProduction = !isBuildIntentDevelopment;

export const rootDirname = path.resolve(__dirname, '../..');
export const srcDirname = path.join(rootDirname, './src');

export const webpackMode = isBuildIntentProduction ? 'production' : 'development';

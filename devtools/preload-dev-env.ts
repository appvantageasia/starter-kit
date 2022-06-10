import path from 'path';
import loadEnvConfig from './env';

const rootDirname = path.relative(__dirname, '..');

loadEnvConfig(rootDirname, true, false);

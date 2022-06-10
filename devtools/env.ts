import fs from 'fs';
import path from 'path';
import { parse } from 'dotenv';
import { expand, DotenvExpandOutput } from 'dotenv-expand';

let combinedEnv: ReturnType<typeof processEnv>;

const cachedLoadedEnvFiles: { path: string; contents: string }[] = [];

const processEnv = (loadedEnvFiles, dir, verbose = true): DotenvExpandOutput['parsed'] => {
    const origEnv = { ...process.env };
    const parsed = {};

    for (const envFile of loadedEnvFiles) {
        try {
            let result: DotenvExpandOutput = {};

            result.parsed = parse(envFile.contents);
            result = expand(result);

            if (result.parsed && verbose) {
                console.info(`Loaded env from ${path.join(dir || '', envFile.path)}`);
            }

            for (const key of Object.keys(result.parsed || {})) {
                if (typeof parsed[key] === 'undefined' && typeof origEnv[key] === 'undefined') {
                    parsed[key] = result.parsed?.[key];
                }
            }
        } catch (error) {
            console.error(`Failed to load env from ${path.join(dir || '', envFile.path)}`, error);
        }
    }

    return Object.assign(process.env, parsed);
};

const getMode = (isTest, dev) => {
    if (isTest) {
        return 'test';
    }

    if (dev) {
        return 'development';
    }

    return 'production';
};

const loadEnvConfig = (dir, dev = false, verbose = true) => {
    // don't reload env if we already have since this breaks escaped
    if (combinedEnv) {
        return { combinedEnv, loadedEnvFiles: cachedLoadedEnvFiles };
    }

    const isTest = process.env.NODE_ENV === 'test';
    const mode = getMode(isTest, dev);

    const dotenvFiles = [
        `.env.${mode}.local`,
        // Don't include `.env.local` for `test` environment
        // since normally you expect tests to produce the same
        // results for everyone
        mode !== 'test' && `.env.local`,
        `.env.${mode}`,
        '.env',
    ].filter(Boolean);

    for (const envFile of dotenvFiles) {
        // only load .env if the user provided has an env config file
        const dotEnvPath = path.join(dir, envFile);

        try {
            const stats = fs.statSync(dotEnvPath);

            // make sure to only attempt to read files
            if (!stats.isFile()) {
                continue;
            }

            const contents = fs.readFileSync(dotEnvPath, 'utf8');
            cachedLoadedEnvFiles.push({ path: envFile, contents });
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.error(`Failed to load env from ${envFile}`, err);
            }
        }
    }

    combinedEnv = processEnv(cachedLoadedEnvFiles, dir, verbose);

    return { combinedEnv, loadedEnvFiles: cachedLoadedEnvFiles };
};

export default loadEnvConfig;

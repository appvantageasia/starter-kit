import http from 'http';
import path from 'path';
import chalk from 'chalk';
import express from 'express';
import httpProxy from 'http-proxy';
import { choosePort } from 'react-dev-utils/WebpackDevServerUtils';
import clearConsole from 'react-dev-utils/clearConsole';
import printBuildError from 'react-dev-utils/printBuildError';
import rimraf from 'rimraf';
import webpack from 'webpack';
import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';
import type { Bundle } from '../../../src/server';
import loadEnvConfig from '../../env';
import webpackConfigs from '../../webpack';
import { rootDirname, buildDirname } from '../../webpack/variables';
import MigrationRunner from './MigrationRunner';
import ServerRunner from './ServerRunner';
import WorkerRunner from './WorkerRunner';

export type BundleEntry = Bundle;

// resolve the path to get the entrypoint for the server once built
const serverEntry = path.join(buildDirname, 'server.js');

// is it running in an interactive shell
const isInteractive = process.stdout.isTTY;

class MainRunner {
    private serverRunner: ServerRunner;

    private workerRunner: WorkerRunner;

    private migrationRunner: MigrationRunner;

    private runners: [MigrationRunner, ServerRunner, WorkerRunner];

    private latestRun: number;

    private compiler: webpack.MultiCompiler;

    private serverCompiler: webpack.Compiler;

    private appCompiler: webpack.Compiler;

    private port: number | null;

    private appCompilerPromise: Promise<void>;

    private appCompilerResolve: () => void;

    constructor() {
        // create runner
        this.serverRunner = new ServerRunner();
        this.workerRunner = new WorkerRunner();
        this.migrationRunner = new MigrationRunner();

        // list runners
        this.runners = [this.migrationRunner, this.serverRunner, this.workerRunner];

        // initialize latest run ID
        this.latestRun = 0;

        // empty build directory
        rimraf.sync(buildDirname);

        // start a multi-compiler
        this.compiler = webpack(webpackConfigs);

        // isolate the two compilers
        this.serverCompiler = this.compiler.compilers.find(instance => instance.name === 'server');
        this.appCompiler = this.compiler.compilers.find(instance => instance.name === 'app');

        this.appCompilerPromise = null;
        this.appCompilerResolve = null;

        this.appCompiler.hooks.compile.tap('DevRunner', () => {
            this.appCompilerPromise = new Promise(resolve => {
                this.appCompilerResolve = resolve;
            });
        });

        this.appCompiler.hooks.done.tap('DevRunner', () => {
            this.appCompilerResolve();
        });

        // port on which the app is running
        this.port = null;

        // load environment
        loadEnvConfig(rootDirname, true);
    }

    async start() {
        await this.startWebServer();

        // watch the server compiler
        this.serverCompiler.watch({}, this.onUpdates.bind(this));
    }

    async onUpdates(error, stats) {
        this.latestRun += 1;
        const activeRun = this.latestRun;

        const isOutdated = () => activeRun !== this.latestRun;

        await this.appCompilerPromise;

        if (isOutdated()) {
            return;
        }

        if (isInteractive) {
            clearConsole();
        }

        if (error) {
            printBuildError(error);
        }

        if (!error && !stats.hasErrors()) {
            try {
                // we cannot apply the update so we will reload the whole server
                // but first delete the node cache
                delete require.cache[serverEntry];

                // stop runners
                for (const runner of this.runners) {
                    // eslint-disable-next-line no-await-in-loop
                    await runner.stop();

                    if (isOutdated()) {
                        // this run is outdated
                        return;
                    }
                }

                // cleanup previous worker
                await this.workerRunner.stop();

                // now we can get the latest version of our server
                // eslint-disable-next-line global-require, import/no-unresolved, import/no-dynamic-require
                const bundle = require(serverEntry).default as BundleEntry;

                // start runners
                for (const runner of this.runners) {
                    // eslint-disable-next-line no-await-in-loop
                    await runner.start(bundle, isOutdated);

                    if (isOutdated()) {
                        // this run is outdated
                        return;
                    }
                }

                console.warn(chalk.cyan(`Server is listening on ${this.port}`));
            } catch (runtimeError) {
                // print the error
                console.error(runtimeError);
            }
        }
    }

    async startWebServer() {
        this.port = await choosePort('0.0.0.0', 3000);

        // create an express server to serve the application as a whole
        const app = express();

        // create a proxy but do not define a target yet
        const proxy = httpProxy.createProxyServer({ xfwd: true });

        // print error when there's any
        proxy.on('error', () => {
            // simply ignore the error
            // as it's not critical to us
        });

        app.use(
            // use the dev middleware to provide hot reload on the frontend
            devMiddleware(this.appCompiler, {
                stats: 'errors-only',
                serverSideRender: true,
                writeToDisk: true,
                publicPath: '/public/',
            })
        );

        // propagate hot reload
        app.use(hotMiddleware(this.appCompiler));

        app.use(async (req, res, next) => {
            try {
                proxy.web(req, res, { target: await this.serverRunner.getUrl() });
            } catch (error) {
                next(error);
            }
        });

        // create the http server
        const httpServer = http.createServer(app);

        httpServer.on('upgrade', async (req, socket, head) => {
            try {
                proxy.ws(req, socket, head, { target: await this.serverRunner.getUrl() });
            } catch (error) {
                // do nothing about it
            }
        });

        httpServer.listen(this.port);
    }
}

export default MainRunner;

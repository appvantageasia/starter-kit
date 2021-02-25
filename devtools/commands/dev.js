const path = require('path');
const chalk = require('chalk');
const express = require('express');
const httpProxy = require('http-proxy');
const clearConsole = require('react-dev-utils/clearConsole');
const printBuildError = require('react-dev-utils/printBuildError');
const listen = require('test-listen');
const webpack = require('webpack');
const devMiddleware = require('webpack-dev-middleware');
const loadEnvConfig = require('../env');
const webpackConfigs = require('../webpack');
const { rootDirname } = require('../webpack/variables');

// is it running in an interactive shell
const isInteractive = process.stdout.isTTY;

// start a multi-compiler
const compiler = webpack(webpackConfigs);

// isolate the two compilers
const serverCompiler = compiler.compilers.find(instance => instance.name === 'server');
const appCompiler = compiler.compilers.find(instance => instance.name === 'app');

// load environment
loadEnvConfig(rootDirname, true);

// create an express server to serve the application as a whole
const app = express();

// latest http server instance for the backend
let server = null;
// latest promise to wait for a compilation
let serverPromise = null;
// latest resolver for the above promise
let serverPromiseResolve = null;
// latest url on which the http server for backend is being served
let serverUrl;

// function to create a new promise on a pending compilation
const createPendingServer = () => {
    serverPromise = new Promise(resolve => {
        // wrap the resolver
        serverPromiseResolve = async newServer => {
            // get a proper listener
            serverUrl = await listen(newServer);
            // finally call the oriignal resolver
            resolve(serverUrl);
        };
    });
};

// create a first promise
createPendingServer();

// latest worker instance (= cleanup method)
let stopWorker = null;

// create a proxy but do not define a target yet
const proxy = httpProxy.createProxyServer({});

app.use(
    // use the dev middleware to provide hot reload on the frontend
    devMiddleware(appCompiler, {
        serverSideRender: true,
        writeToDisk: true,
    })
);

app.use(async (req, res, next) => {
    try {
        // wait for the compilation to be done
        await serverPromise;
        // and then proxy the request to the backend
        proxy.web(req, res, { target: serverUrl });
    } catch (error) {
        next(error);
    }
});

// resolve the path to get the entrypoint for the server once built
const serverEntry = path.resolve('./build/server.js');

// watch the server compiler
serverCompiler.watch({}, async (error, stats) => {
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

            const isReload = !!server;

            // cleanup previous server
            if (server) {
                try {
                    server.close();
                    // do a reset
                    server = null;
                    createPendingServer();
                } catch (cleanUpError) {
                    console.error(cleanUpError);
                }
            }

            // cleanup previous worker
            if (stopWorker) {
                try {
                    // clean up the previous worker
                    await stopWorker();
                    // do a reset
                    stopWorker = null;
                } catch (cleanUpError) {
                    console.error(cleanUpError);
                }
            }

            // now we can get the latest version of our server
            // eslint-disable-next-line global-require, import/no-unresolved, import/no-dynamic-require
            const { createWebServer, startWorker } = require(serverEntry);

            // create http server
            server = createWebServer().httpServer;
            serverPromiseResolve(server);

            // start async workers
            stopWorker = startWorker();

            if (isReload) {
                console.warn(chalk.cyan('Server has been reloaded.'));
            }
        } catch (runtimeError) {
            // print the error
            console.error(runtimeError);
        }
    }
});

app.listen(3000, () => {
    console.info('Server listening on port 3000');
});

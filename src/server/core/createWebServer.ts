// create http server
import http, { Server } from 'http';
import * as Sentry from '@sentry/node';
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import express, { Express, Handler, Request, Response } from 'express';
import { execute, subscribe } from 'graphql';
import { graphqlUploadExpress } from 'graphql-upload';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import schema from '../schema';
import createContext, { Context, RootDocument } from '../schema/context';
import config from './config';
import { createHealthRouter } from './health';
import setupPrometheusMetrics, { ApolloMetricsPlugin } from './prometheus';
import { expressRateLimiter } from './rateLimiter';
import renderApplication from './renderApplication';
import { ApolloSentryPlugin } from './sentry';

export type WebServerCreation = {
    httpServer: Server;
    expressServer: Express;
    apolloServer: ApolloServer;
};

const rateLimiterMiddleware: Handler = (req, res, next) => {
    expressRateLimiter
        .consume(req.ip, 1)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).send('Too Many Requests');
        });
};

const protectGraphQLEndpoint: Handler = (req, res, next) => {
    // prevent XSS attacks
    res.set({ 'X-Content-Type-Options': 'nosniff' });

    // move on
    next();
};

const disableCaching: Handler = (req, res, next) => {
    // update headers
    res.set({
        'Cache-control': 'no-store',
        Pragma: 'no-cache',
    });

    // move on
    next();
};

const createWebServer = async (): Promise<WebServerCreation> => {
    // prepare plugins for apollo
    const plugins: ApolloServerExpressConfig['plugins'] = [ApolloSentryPlugin];

    if (config.prometheus.enabled) {
        plugins.push(ApolloMetricsPlugin);
    }

    // create apollo server
    const apolloServer = new ApolloServer({
        schema,

        // provide a custom context
        context: ({ req, res }: { req: Request; res: Response }): Promise<Context> => createContext(req, res),

        // provide a custom root document
        rootValue: (): RootDocument => null,

        // apollo plugins
        plugins,
    });

    // start apollo server
    await apolloServer.start();

    // create express server
    const expressServer = express();

    // disable informational headers
    expressServer.disable('x-powered-by');

    if (config.gzip) {
        // enable compression
        // we might want to disable it it's delegated to a reverse proxy
        expressServer.use(compression());
    }

    // enable JSON and url encoded support
    expressServer.use(express.json());
    expressServer.use(express.urlencoded({ extended: true }));

    // enable Sentry scope
    expressServer.use(Sentry.Handlers.requestHandler());

    // setup prometheus metrics
    await setupPrometheusMetrics(expressServer);

    if (config.sentry.tracing) {
        expressServer.use(Sentry.Handlers.tracingHandler());
    }

    // serve static files
    expressServer.use('/public', express.static('public'));

    // apply cors
    expressServer.use(
        cors((req, callback) => {
            // in production we expect the app to be served behind a reverse proxy such as the ingress controller
            // if so we rely on those information which are trust worthy as those are defined by the proxy itself
            const host = req.header('X-Forwarded-Host');
            const scheme = req.header('X-Forwarded-Scheme') || 'https';

            // apply cors
            callback(null, { origin: host ? `${scheme}://${host}` : false });
        })
    );

    // then from here use rate limiter
    expressServer.use(rateLimiterMiddleware);

    // update cache policy
    expressServer.use(disableCaching);

    // health endpoints
    expressServer.use('/healthChecks', createHealthRouter());

    // serve graphql API
    expressServer.use(
        '/graphql',
        protectGraphQLEndpoint,
        graphqlUploadExpress(),
        apolloServer.getMiddleware({ bodyParserConfig: { limit: '50mb' }, path: '/', cors: false })
    );

    // otherwise fallback on the application
    expressServer.get('*', (req, res, next) => {
        renderApplication(req, res, next);
    });

    // sse the sentry error handler before any other error handler
    expressServer.use(Sentry.Handlers.errorHandler());

    // then here comes our error handler
    // eslint-disable-next-line no-unused-vars
    expressServer.use((error, request, response, next) => {
        console.error(error);
        response.status('500').send('Internal error');
    });

    // create the http server
    const httpServer = http.createServer(expressServer);

    // install websocket support
    const subscriptionServer = SubscriptionServer.create(
        {
            schema,

            // coming from graphql
            execute,
            subscribe,

            // provide a custom context
            onConnect: (connectionParams, webSocket, context): Promise<Context> =>
                createContext(context.request, context.response),

            // provide a custom root document
            rootValue: (): RootDocument => null,
        },
        {
            server: httpServer,
            path: '/graphql',
        }
    );

    // close subscription server whenever http server closes
    httpServer.on('close', () => {
        subscriptionServer.close();
    });

    return { httpServer, apolloServer, expressServer };
};

export default createWebServer;

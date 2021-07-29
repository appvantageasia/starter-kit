// create http server
import http, { Server } from 'http';
import * as Sentry from '@sentry/node';
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import compression from 'compression';
import express, { Express, Handler, Request } from 'express';
import { execute, subscribe } from 'graphql';
import { graphqlUploadExpress } from 'graphql-upload';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import schema from '../schema';
import createContext, { Context, RootDocument } from '../schema/context';
import config from './config';
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
        context: ({ req }: { req: Request }): Promise<Context> => createContext(req),

        // provide a custom root document
        rootValue: (): RootDocument => null,

        // apollo plugins
        plugins,
    });

    // start apollo server
    await apolloServer.start();

    // create express server
    const expressServer = express();
    expressServer.disable('x-powered-by');
    expressServer.use(compression());
    expressServer.use(express.json());
    expressServer.use(express.urlencoded({ extended: true }));
    expressServer.use(Sentry.Handlers.requestHandler());

    // setup prometheus metrics
    await setupPrometheusMetrics(expressServer);

    if (config.sentry.tracing) {
        expressServer.use(Sentry.Handlers.tracingHandler());
    }

    // serve static files
    expressServer.use('/public', express.static('public'));

    // then from here use rate limiter
    expressServer.use(rateLimiterMiddleware);

    // serve graphql API
    expressServer.use(
        '/graphql',
        graphqlUploadExpress(),
        apolloServer.getMiddleware({ bodyParserConfig: { limit: '50mb' }, path: '/' })
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
            onConnect: (connectionParams, webSocket, context): Promise<Context> => createContext(context.request),

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

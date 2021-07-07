// create http server
import http, { Server } from 'http';
import * as Sentry from '@sentry/node';
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import compression from 'compression';
import express, { Express, Handler, Request } from 'express';
import { graphqlUploadExpress } from 'graphql-upload';
import { ExecutionParams } from 'subscriptions-transport-ws';
import config from './config';
import { ApolloMetricsPlugin } from './prometheus';
import { expressRateLimiter } from './rateLimiter';
import renderApplication from './renderApplication';
import schema from './schema';
import createContext, { Context, RootDocument } from './schema/context';
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

const createWebServer = (): WebServerCreation => {
    const plugins: ApolloServerExpressConfig['plugins'] = [ApolloSentryPlugin];

    if (config.prometheus.enabled) {
        plugins.push(ApolloMetricsPlugin);
    }

    const apolloServer = new ApolloServer({
        schema,
        // do not use the build-in upload types
        uploads: false,

        // enable tracing for development purposes
        tracing: !!process.isDev,
        playground: !!process.isDev,

        // provide a custom context
        context: ({ req, connection }: { req: Request; connection: ExecutionParams }): Promise<Context> => {
            if (connection) {
                return connection?.context;
            }

            return createContext(req);
        },

        subscriptions: {
            onConnect: async (connectionParams, webSocket, context): Promise<Context> => createContext(context.request),
        },

        // provide a custom root document
        rootValue: (): RootDocument => null,

        plugins,
    });

    const expressServer = express();
    expressServer.disable('x-powered-by');
    expressServer.use(compression());
    expressServer.use(express.json());
    expressServer.use(express.urlencoded({ extended: true }));
    expressServer.use(Sentry.Handlers.requestHandler());

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
    expressServer.use((req, res, next) => {
        if (req.method !== 'GET') {
            // only accept GET requests
            next();
        } else {
            renderApplication(req, res, next);
        }
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
    apolloServer.installSubscriptionHandlers(httpServer);

    return { httpServer, apolloServer, expressServer };
};

export default createWebServer;

// create http server
import http, { IncomingMessage, Server } from 'http';
import * as Sentry from '@sentry/node';
import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import express, { Express } from 'express';
import { graphqlUploadExpress } from 'graphql-upload';
import config from './config';
import renderApplication from './renderApplication';
import schema from './schema';
import createContext, { Context, RootDocument } from './schema/context';
import { ApolloSentryPlugin } from './sentry';

export type WebServerCreation = {
    httpServer: Server;
    expressServer: Express;
    apolloServer: ApolloServer;
};

const createWebServer = (): WebServerCreation => {
    const apolloServer = new ApolloServer({
        schema,
        // do not use the build-in upload types
        uploads: false,

        // enable tracing for development purposes
        tracing: !!process.isDev,
        playground: !!process.isDev,

        // provide a custom context
        context: ({ req }: { req: IncomingMessage }): Promise<Context> => createContext(req),

        // provide a custom root document
        rootValue: (): RootDocument => null,

        plugins: [ApolloSentryPlugin],
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

    const httpServer = http.createServer(expressServer);

    return { httpServer, apolloServer, expressServer };
};

export default createWebServer;

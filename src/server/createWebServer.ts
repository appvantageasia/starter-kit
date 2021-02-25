// create http server
import http, { IncomingMessage, Server } from 'http';
import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import express, { Express } from 'express';
import { graphqlUploadExpress } from 'graphql-upload';
import schema from './schema';
import createContext, { Context, RootDocument } from './schema/context';

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
        tracing: process.env.NODE_ENV === 'development',

        // provide a custom context
        context: ({ req }: { req: IncomingMessage }): Promise<Context> => createContext(req),

        // provide a custom root document
        rootValue: (): RootDocument => null,
    });

    const expressServer = express();
    expressServer.disable('x-powered-by');
    expressServer.use(compression());
    expressServer.use(express.json());
    expressServer.use(express.urlencoded({ extended: true }));

    expressServer.use(
        '/graphql',
        graphqlUploadExpress(),
        apolloServer.getMiddleware({ bodyParserConfig: { limit: '50mb' }, path: '/' })
    );

    expressServer.use((req, res) => {
        res.send('hello world');
    });

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

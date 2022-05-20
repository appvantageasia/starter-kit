import { ApolloClient, ApolloLink, from, InMemoryCache, NormalizedCacheObject, HttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createUploadLink } from 'apollo-upload-client';
import { extractFiles } from 'extract-files';
import { createClient as createWsClient } from 'graphql-ws';
import { i18n as I18n } from 'i18next';
import { isObject, flow, mapValues, omit } from 'lodash/fp';
import PubSub from 'pubsub-js';
import introspection from './api/introspection';

const prepareForGraphQL = (data: any): any => {
    if (data instanceof Date) {
        return data.toISOString();
    }

    if (Array.isArray(data)) {
        return data.map(prepareForGraphQL);
    }

    if (data instanceof File) {
        return data;
    }

    if (isObject(data)) {
        return flow([omit(['__typename']), mapValues(prepareForGraphQL)])(data);
    }

    return data;
};

const createWsLink = (getContext: GetContext) => {
    // track if a restart is requested
    let restartRequested = false;

    // restart handler
    let restart = () => {
        restartRequested = true;
    };

    // restart whenever the token changed
    PubSub.subscribe('core.tokenUpdate', () => restart());

    const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';

    // create ws link
    return new GraphQLWsLink(
        createWsClient({
            url: `${scheme}://${window.location.host}/graphql`,
            lazy: true,

            // provide authorization header in connection params
            connectionParams: () => {
                const { token } = getContext();

                if (token) {
                    return { authorization: token };
                }

                return {};
            },

            on: {
                // we usually need to restart whenever the token changed
                // so we need graceful restarts
                opened: socket => {
                    restart = () => {
                        // @ts-ignore
                        if (socket.readyState === WebSocket.OPEN) {
                            // if the socket is still open for the restart, do the restart
                            // @ts-ignore
                            socket.close(4205, 'Client Restart');
                        } else {
                            // otherwise the socket might've closed, indicate that you want
                            // a restart on the next opened event
                            restartRequested = true;
                        }
                    };

                    // just in case you were eager to restart
                    if (restartRequested) {
                        restartRequested = false;
                        restart();
                    }
                },
            },
        })
    );
};

const getCache = () => {
    const cache = new InMemoryCache({ possibleTypes: introspection.possibleTypes });
    const initialStateElement = document.querySelector('script[data-role="runtime-config"]');

    if (!initialStateElement) {
        return cache;
    }

    // restore from state
    cache.restore(JSON.parse(initialStateElement.textContent));

    return cache;
};

type GetContext = () => { i18n: I18n; token: string | undefined };

const createApolloClient = (getContext: GetContext): ApolloClient<NormalizedCacheObject> => {
    // push the JWT token in headers
    const authLink = new ApolloLink((operation, forward) => {
        operation.setContext(({ headers }) => {
            const { i18n, token } = getContext();
            const customHeaders = { ...headers, 'Accept-Language': i18n.language };

            if (token) {
                customHeaders.Authorization = `Bearer ${token}`;
            }

            return {
                headers: customHeaders,
            };
        });

        return forward(operation);
    });

    // if there's file we are going to use the upload link
    // otherwise use the batch http link
    const httpLink = ApolloLink.split(
        operation => extractFiles(operation).files.size > 0,
        createUploadLink({ uri: '/graphql', credentials: 'include' }),
        new HttpLink({ uri: '/graphql', credentials: 'include' })
    );

    // websocket link
    const wsLink = createWsLink(getContext);

    // split between HTTP and WS protocols
    const rootLink = ApolloLink.split(
        ({ query }) => {
            const definition = getMainDefinition(query);

            return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
        },
        wsLink,
        from([authLink, httpLink])
    );

    // on not authenticated listener
    const disconnectLink = onError(({ graphQLErrors }) => {
        if (graphQLErrors) {
            const isUnauthenticated = graphQLErrors.some(error => error.extensions.code === 'UNAUTHENTICATED');

            if (isUnauthenticated) {
                PubSub.publish('core.unauthenticated');
            }
        }
    });

    // link to clean data
    const cleanLink = new ApolloLink((operation, forward) => {
        // eslint-disable-next-line no-param-reassign
        operation.variables = prepareForGraphQL(operation.variables);

        return forward(operation);
    });

    return new ApolloClient({
        ssrMode: false,
        link: from([cleanLink, disconnectLink, rootLink]),
        cache: getCache(),
    });
};

export default createApolloClient;

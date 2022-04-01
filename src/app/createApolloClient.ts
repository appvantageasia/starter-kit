import { ApolloClient, ApolloLink, from, InMemoryCache, NormalizedCacheObject, HttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { createUploadLink } from 'apollo-upload-client';
import { extractFiles } from 'extract-files';
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

const createApolloClient = (
    getContext: () => { i18n: I18n; token: string | undefined }
): ApolloClient<NormalizedCacheObject> => {
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
    const wsLink = new WebSocketLink({
        uri: `ws://${window.location.host}/graphql`,
        options: {
            reconnect: true,
            lazy: true,
            connectionParams: () => {
                const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;

                if (token) {
                    return { authToken: token };
                }

                return {};
            },
        },
    });

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
                PubSub.publish('core.jwtInvalid');
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
        cache: new InMemoryCache({ possibleTypes: introspection.possibleTypes }),
    });
};

export default createApolloClient;

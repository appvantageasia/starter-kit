import { Readable } from 'stream';
import { ApolloClient, ApolloLink, from, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { createUploadLink, isExtractableFile } from 'apollo-upload-client';
import { Encoder } from 'form-data-encoder';
import { FormData, File } from 'formdata-node';
import fetch from 'node-fetch';

export type ApolloClientOptions = { authorizationToken?: string; language?: string };

export const getApolloClient = (uri: string, options?: ApolloClientOptions): ApolloClient<NormalizedCacheObject> => {
    const authLink = new ApolloLink((operation, forward) => {
        operation.setContext(({ headers }) => {
            const customHeaders = { ...headers };

            if (options?.language) {
                customHeaders['Accept-Language'] = options?.language;
            }

            if (options?.authorizationToken) {
                customHeaders.Authorization = `Bearer ${options?.authorizationToken}`;
            }

            return {
                headers: customHeaders,
            };
        });

        return forward(operation);
    });

    const httpLink = createUploadLink({
        uri: `${uri}/graphql`,
        FormData,
        isExtractableFile: value => isExtractableFile(value) || value instanceof File,
        fetch: async (url, options) => {
            const nextOptions = { ...options };

            if (options?.body instanceof FormData) {
                const encoder = new Encoder(options.body);
                nextOptions.headers = { ...nextOptions.headers, ...encoder.headers };
                nextOptions.body = Readable.from(encoder);
            }

            return fetch(url, nextOptions);
        },
    });

    return new ApolloClient({
        link: from([authLink, httpLink]),
        cache: new InMemoryCache(),
    });
};

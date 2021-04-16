import { createReadStream } from 'fs';
import { ApolloClient, ApolloLink, from, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import Blob from 'fetch-blob';
import FormData from 'form-data';
import NodeFormData from 'formdata-node';
import nodeFetch from 'node-fetch';

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
        FormData: NodeFormData,
        fetch: async (url, options) => {
            const nextOptions = { ...options };

            if (options?.body instanceof NodeFormData) {
                // formdata-node is not fully supported by node-fetch
                // at least on the v2.6.x (maybe on v3)
                // therefore we are going to copy the entries to form-data instead
                // we cannot directly use form-data for graphql-upload because it doesn't support node streams
                const formData = options?.body as NodeFormData;
                const nextFormData = new FormData();

                // @ts-ignore
                for (const [field, value] of formData.entries()) {
                    const blob = value?.__content;

                    if (blob instanceof Blob) {
                        // @ts-ignore
                        nextFormData.append(field, createReadStream(blob.__filePath));
                    } else {
                        nextFormData.append(field, value);
                    }

                    nextOptions.body = nextFormData;
                }
            }

            return nodeFetch(url, nextOptions);
        },
    });

    return new ApolloClient({
        link: from([authLink, httpLink]),
        cache: new InMemoryCache(),
    });
};

import { Readable } from 'stream';
import { ApolloClient, ApolloLink, from, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { createUploadLink, isExtractableFile } from 'apollo-upload-client';
import cookie from 'cookie';
import { Encoder } from 'form-data-encoder';
import { FormData, File } from 'formdata-node';
import fetch from 'node-fetch';

export type ApolloClientOptions = {
    authorizationToken?: string;
    language?: string;
    csrf?: string;
};

export type CSRFGetter = () => string;

export const getApolloClient = (
    uri: string,
    options?: ApolloClientOptions
): {
    client: ApolloClient<NormalizedCacheObject>;
    getCSRF: CSRFGetter;
} => {
    let rawCookie = options?.csrf ? cookie.serialize('CSRF', options.csrf, { httpOnly: true, sameSite: 'strict' }) : '';

    const authLink = new ApolloLink((operation, forward) => {
        operation.setContext(({ headers }) => {
            const customHeaders = { ...headers };

            if (options?.language) {
                customHeaders['Accept-Language'] = options?.language;
            }

            if (options?.authorizationToken) {
                customHeaders.Authorization = `Bearer ${options?.authorizationToken}`;
            }

            if (rawCookie) {
                customHeaders.Cookie = rawCookie;
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

            const response = await fetch(url, nextOptions);

            // update cookies
            const newCookies = response.headers.get('Set-Cookie');

            if (newCookies) {
                rawCookie = newCookies;
            }

            return response;
        },
    });

    return {
        getCSRF: () => cookie.parse(rawCookie)?.CSRF || '',
        client: new ApolloClient({
            link: from([authLink, httpLink]),
            cache: new InMemoryCache(),
        }),
    };
};

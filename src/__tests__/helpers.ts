import { createReadStream } from 'fs';
import fs from 'fs/promises';
import { Server } from 'http';
import { ApolloLink, ApolloClient, InMemoryCache, NormalizedCacheObject, from } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { Document, EJSON } from 'bson';
import Blob from 'fetch-blob';
import FormData from 'form-data';
import NodeFormData from 'formdata-node';
import nodeFetch from 'node-fetch';
import listen from 'test-listen';
import config from '../server/config';
import createWebServer from '../server/createWebServer';
import { migrate, getDatabaseContext } from '../server/database';
import { minioClient } from '../server/storage';

const originalGlobals = { ...global };

export const setupFormDataSupport = async (): Promise<void> => {
    // @ts-ignore
    global.fetch = nodeFetch;
    // @ts-ignore
    global.FormData = FormData;
    // @ts-ignore
    global.Blob = Blob;
};

export const cleanFormDataSupport = async (): Promise<void> => {
    global.fetch = originalGlobals.fetch;
    global.FormData = originalGlobals.FormData;
    global.Blob = originalGlobals.Blob;
};

export const setupDatabase = async (): Promise<void> => {
    // get the database
    const { db } = await getDatabaseContext();
    // execute migrations
    await migrate(db, false);
};

export const cleanDatabase = async (): Promise<void> => {
    // get the database
    const { db, mongoClient } = await getDatabaseContext();
    // drop the database
    await db.dropDatabase();
    // close database
    await new Promise(resolve => mongoClient.close(resolve));
    // reset mongo global store
    global.mongo = { instance: null, promise: null };
};

export const setupWebService = () => {
    let service: Server = null;
    let url: string;

    return {
        get url(): string {
            return url;
        },
        get server(): Server {
            return service;
        },
        initialize: async () => {
            // create micro service first
            service = createWebServer().httpServer;
            // then get the url
            url = await listen(service);
        },
        cleanUp: async () => {
            // close the server/service
            await service.close();
        },
    };
};

export const composeHandlers = (...handlers: (() => Promise<void>)[]) => () =>
    handlers.reduce((promise, handler) => promise.then(handler), Promise.resolve());

export type Fixtures = { [collection: string]: Document[] };

export const loadFixtures = (fixtures: Fixtures) => async (): Promise<void> => {
    // get the database
    const { db } = await getDatabaseContext();

    // use bulk operations to write new entries in the database for each collection
    const promises = Object.entries(EJSON.deserialize(fixtures)).map(([collection, documents]) =>
        db.collection(collection).bulkWrite(documents.map(document => ({ insertOne: { document } })))
    );

    // wait for them all
    await Promise.all(promises);
};

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

const { bucket } = config.storage;

const emptyBucket = async (): Promise<void> => {
    const stream = await minioClient.listObjectsV2(bucket, '', true);

    return new Promise((resolve, reject) => {
        const objectNames = [];

        stream.on('data', object => {
            objectNames.push(object.name);
        });

        stream.on('error', reject);

        stream.on('end', async () => {
            if (objectNames.length) {
                await minioClient.removeObjects(bucket, objectNames);
            }

            resolve();
        });
    });
};

export const setupEmptyBucket = async (): Promise<void> => {
    const alreadyExist = await minioClient.bucketExists(bucket);

    if (alreadyExist) {
        await emptyBucket();
        await minioClient.removeBucket(bucket);
    }

    await minioClient.makeBucket(bucket, config.storage.provider.region);
};

export const createBlobFrom = async (path: string, type: string): Promise<Blob> => {
    const buffer = await fs.readFile(path);
    const blob = new Blob([buffer], { type });

    // @ts-ignore
    blob.__filePath = path;

    return blob;
};

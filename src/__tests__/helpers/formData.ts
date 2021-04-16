import fs from 'fs/promises';
import { Server } from 'http';
import Blob from 'fetch-blob';
import FormData from 'form-data';
import nodeFetch from 'node-fetch';
import listen from 'test-listen';
import createWebServer from '../../server/createWebServer';

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

export const createBlobFrom = async (path: string, type: string): Promise<Blob> => {
    const buffer = await fs.readFile(path);
    const blob = new Blob([buffer], { type });

    // @ts-ignore
    blob.__filePath = path;

    return blob;
};

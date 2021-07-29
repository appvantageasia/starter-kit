import fs from 'fs/promises';
import { Server } from 'http';
import { basename } from 'path';
import { File } from 'formdata-node';
import listen from 'test-listen';
import createWebServer from '../../server/core/createWebServer';

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
            service = (await createWebServer()).httpServer;
            // then get the url
            url = await listen(service);
        },
        cleanUp: async () => {
            // close the server/service
            await service.close();
        },
    };
};

export const createBlobFrom = async (path: string): Promise<File> => {
    const buffer = await fs.readFile(path);

    return new File([buffer], basename(path));
};

import { Server } from 'http';
import listen from 'test-listen';
import { BundleEntry } from './index';

export default class ServerRunner {
    private server: Server;

    private serverPromise: Promise<string>;

    private serverPromiseResolve: (server: Server) => void;

    private serverUrl: string;

    constructor() {
        // latest http server instance for the backend
        this.server = null;
        // latest promise to wait for a compilation
        this.serverPromise = null;
        // latest resolver for the above promise
        this.serverPromiseResolve = null;
        // server URL
        this.serverUrl = null;

        // initialize it right await
        this.createPendingServer();
    }

    async start({ createWebServer }: BundleEntry) {
        // create http server
        this.server = (await createWebServer()).httpServer;
        this.serverPromiseResolve(this.server);
    }

    async getUrl() {
        // wait for it to be ready
        await this.serverPromise;

        // then return active URL
        return this.serverUrl;
    }

    // function to create a new promise on a pending compilation
    createPendingServer() {
        this.serverPromise = new Promise(resolve => {
            // wrap the resolver
            this.serverPromiseResolve = async newServer => {
                // get a proper listener
                this.serverUrl = await listen(newServer);
                // finally call the orignal resolver
                resolve(this.serverUrl);
            };
        });
    }

    async stop() {
        if (this.server) {
            // cleanup previous server
            try {
                this.server.close();
            } catch (cleanUpError) {
                console.error(cleanUpError);
            } finally {
                // do a reset
                this.server = null;
                this.createPendingServer();
            }
        }
    }
}

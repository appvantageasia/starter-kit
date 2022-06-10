import { BundleEntry } from './index';

export default class WorkerRunner {
    private cleanUp: (() => Promise<void>) | null;

    constructor() {
        this.cleanUp = null;
    }

    async start({ startWorker }: BundleEntry) {
        this.cleanUp = startWorker();
    }

    async stop() {
        if (this.cleanUp) {
            try {
                // clean up the previous worker
                await this.cleanUp();
            } catch (cleanUpError) {
                console.error(cleanUpError);
            } finally {
                this.cleanUp = null;
            }
        }
    }
}

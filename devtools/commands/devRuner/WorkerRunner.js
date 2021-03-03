class WorkerRunner {
    constructor() {
        this.cleanUp = null;
    }

    async start({ startWorker }) {
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

module.exports = WorkerRunner;

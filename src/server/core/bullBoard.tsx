import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import chalk from 'chalk';
import express from 'express';
import { queues } from '../queues/setup';
import config from './config';

export const createBoard = () => {
    const serverAdapter = new ExpressAdapter();

    const bullBoard = createBullBoard({
        queues: queues.map(queue => new BullAdapter(queue.queue, { readOnlyMode: true })),
        serverAdapter,
    });

    return { serverAdapter, bullBoard };
};

export const startBoard = () => {
    // create express server
    const expressServer = express();
    // disable informational headers
    expressServer.disable('x-powered-by');
    // then serve the board from the adapter
    expressServer.use(createBoard().serverAdapter.getRouter());

    // start listening
    return expressServer.listen(config.port, () => {
        console.info(chalk.cyan('MSG Bull board server listening'));
    });
};

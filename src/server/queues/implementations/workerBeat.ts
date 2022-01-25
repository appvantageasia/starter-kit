import * as Sentry from '@sentry/node';
import { Document } from 'bson';
import { Job } from 'bull';
import fetch from 'node-fetch';
import config from '../../core/config';
import { runHealthChecks } from '../../core/health';

export type WorkerBeatMessage = {};

export const workerBeatHandler = async (message: WorkerBeatMessage, job: Job<Document>) => {
    if (!config.healthChecks.workerBeat) {
        // there's no beat to call
        return;
    }

    // prepare arguments
    const args = new URLSearchParams();
    args.set('msg', 'OK');

    try {
        // do health check first
        await runHealthChecks();
        // then call the beat
        await fetch(`${config.healthChecks.workerBeat}?${args.toString()}`);
    } catch (error) {
        // print the error and log with Sentry
        console.error(error);
        Sentry.captureException(error);
    }
};

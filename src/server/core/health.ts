import * as Sentry from '@sentry/node';
import chalk from 'chalk';
import express, { Router, RequestHandler } from 'express';
import ipaddr from 'ipaddr.js';
import { getDatabaseContext } from '../database';
import { queues } from '../queues/setup';
import config from './config';
import getPubSub from './pubSub';
import getRedisInstance from './redis';

export enum HealthStatus {
    Starting,
    Running,
    Stopping,
    Stopped,
}

export const runHealthChecks = async () => {
    // check the main redis first
    await getRedisInstance().ping();

    // check pub-sub
    const pubSub = getPubSub();
    await Promise.all([pubSub.getPublisher().ping(), pubSub.getSubscriber().ping()]);

    // check the mongo database
    const { regular, encrypted } = await getDatabaseContext();
    await regular.db.command({ ping: 1 });

    if (regular.client !== encrypted.client) {
        // also ping on encrypted client
        await encrypted.db.command({ ping: 1 });
    }

    // check queues are healthy
    await Promise.all(Object.values(queues).map(queue => queue.isHealthy()));
};

const isIpAllowed = (ip: string) => {
    const origin = ipaddr.parse(ip);

    for (const allowedIp of config.healthChecks.allowed) {
        const cidr = ipaddr.parseCIDR(allowedIp);
        const kind = cidr[0].kind();

        if (origin.kind() === kind && origin.match(cidr)) {
            return true;
        }
    }

    return false;
};

const onlyAllowedIpMiddleware: RequestHandler = (req, res, next) => {
    let ip = req.get('x-forwarded-for') || req.ip || req.connection.remoteAddress;

    // handle IPv4 being mapped to IPv6, most commonly happen on proxies
    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(8);
    }

    if (isIpAllowed(ip)) {
        next();
    } else {
        res.status(403).send('Permission Denied');
    }
};

export class HealthStatusManager {
    private _value: HealthStatus;

    constructor() {
        this._value = HealthStatus.Starting;
    }

    get current() {
        return this._value;
    }

    update(value: HealthStatus) {
        if (value !== this._value) {
            const { label: previousLabel } = this;
            this._value = value;
            const { label: newLabel } = this;
            console.info(chalk.cyan(`MSG Status moved from ${previousLabel} to ${newLabel}`));
        }
    }

    get label() {
        switch (this._value) {
            case HealthStatus.Starting:
                return 'Starting';

            case HealthStatus.Running:
                return 'Running';

            case HealthStatus.Stopping:
                return 'Stopping';

            case HealthStatus.Stopped:
                return 'Stopped';

            default:
                throw new Error('Unknown status');
        }
    }

    createRoute(validStatuses: HealthStatus[]): RequestHandler {
        return async (req, res, next) => {
            try {
                const { current, label } = this;

                if (validStatuses.includes(current)) {
                    // run health check
                    await runHealthChecks();

                    // then reply
                    res.status(200).send(label);
                } else {
                    // provide a 503 response instead
                    res.status(503).send(label);
                }
            } catch (error) {
                // forward the error
                next(error);
            }
        };
    }

    createRouter() {
        // @ts-ignore
        const router = new Router();
        // health checks may be limited to some specific CIDR
        router.use(onlyAllowedIpMiddleware);
        // is the application ready to receive traffic
        router.get('/ready', this.createRoute([HealthStatus.Running]));
        // is the application alive
        router.get('/live', this.createRoute([HealthStatus.Starting, HealthStatus.Running]));

        return router;
    }
}

export const createHealthServer = (manager: HealthStatusManager) => {
    if (!config.healthChecks.enabled) {
        // server not enabled
        return null;
    }

    // create express server
    const expressServer = express();
    // disable informational headers
    expressServer.disable('x-powered-by');
    // health endpoints
    expressServer.use('/.health', manager.createRouter());
    // then here comes our error handler
    // eslint-disable-next-line no-unused-vars
    expressServer.use((error, request, response, next) => {
        // print it for logs
        console.error(error);
        // capture it with Sentry as well
        Sentry.captureException(error);
        // and then reply
        response.status(500).send('Internal error');
    });

    // start listening
    return expressServer.listen(config.healthChecks.port, () => {
        console.info(chalk.cyan('MSG Health server listening'));
    });
};

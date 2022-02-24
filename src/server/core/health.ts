import { Router } from 'express';
import ipaddr from 'ipaddr.js';
import { getDatabaseContext } from '../database';
import * as queues from '../queues/implementations';
import config from './config';
import getRedisInstance from './redis';

export enum HealthStatus {
    Starting,
    Running,
    Stopping,
    Stopped,
}

let currentStatus = HealthStatus.Starting;

const statusLabels = new Map<number, string>([
    [HealthStatus.Starting, 'Starting'],
    [HealthStatus.Running, 'Up'],
    [HealthStatus.Stopped, 'Stopped'],
    [HealthStatus.Stopping, 'Stopping'],
]);

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

export const createHealthRouter = () => {
    // @ts-ignore
    const router = new Router();

    // health checks are meant to be local only
    router.use((req, res, next) => {
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
    });

    router.get('/ready', (req, res) => {
        switch (currentStatus) {
            case HealthStatus.Running:
                res.status(200).send(statusLabels[HealthStatus.Running]);
                break;

            default:
                res.status(503).send(statusLabels[currentStatus]);
                break;
        }
    });

    router.get('/live', (req, res) => {
        switch (currentStatus) {
            case HealthStatus.Starting:
            case HealthStatus.Running:
                runHealChecks()
                    .then(() => res.status(200).send(statusLabels[currentStatus]))
                    .catch((error: Error) => res.status(503).send(error.message));
                break;

            default:
                res.status(503).send(statusLabels[currentStatus]);
                break;
        }
    });

    router.get('/health', (req, res) => {
        switch (currentStatus) {
            case HealthStatus.Running:
                runHealChecks()
                    .then(() => res.status(200).send(statusLabels[HealthStatus.Running]))
                    .catch((error: Error) => res.status(503).send(error.message));
                break;

            default:
                res.status(503).send(statusLabels[currentStatus]);
                break;
        }
    });

    return router;
};

export const updateStatus = (nextStatus: HealthStatus) => {
    currentStatus = nextStatus;
};

export const runHealChecks = async (): Promise<true> => {
    try {
        // check the main redis first
        await getRedisInstance().ping();
    } catch (error) {
        console.error(error);
        throw new Error('Internal Error - Redis unhealthy');
    }

    try {
        // check the mongo database
        const { db } = await getDatabaseContext();
        await db.command({ ping: 1 });
    } catch (error) {
        console.error(error);
        throw new Error('Internal Error - Database unhealthy');
    }

    try {
        // check queues are healthy
        await Promise.all(Object.values(queues).map(queue => queue.isHealthy()));
    } catch (error) {
        console.error(error);
        throw new Error('Internal Error - Worker connections unhealthy');
    }

    return true;
};

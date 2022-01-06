import { Router } from 'express';

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

export const createHealthRouter = () => {
    // @ts-ignore
    const router = new Router();

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
                res.status(200).send(statusLabels[currentStatus]);
                break;

            default:
                res.status(503).send(statusLabels[currentStatus]);
                break;
        }
    });

    router.get('/health', (req, res) => {
        switch (currentStatus) {
            case HealthStatus.Running:
                res.status(200).send(statusLabels[HealthStatus.Running]);
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

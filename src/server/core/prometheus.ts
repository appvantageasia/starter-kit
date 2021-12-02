import { createMiddleware, getSummary, getContentType } from '@promster/express';
import { createServer } from '@promster/server';
import { ApolloServerExpressConfig } from 'apollo-server-express';
import { Express } from 'express';
import * as Prometheus from 'prom-client';
import config from './config';

export const initializeMetrics = async () => {
    // reset metrics first
    const metrics = await Prometheus.register.getMetricsAsArray();

    // unregister the metric
    metrics.forEach(metric => Prometheus.register.removeSingleMetric(metric.name));

    global.apiHistogram = new Prometheus.Histogram({
        labelNames: ['environment', 'operation', 'key', 'typename'],
        name: `${config.prometheus.prefix}graphql_request_milliseconds`,
        help: 'The GraphQL request latencies in milliseconds.',
        buckets: [0.1, 5, 15, 50, 100, 500],
    });
};

export const setupPrometheusMetrics = async (app: Express) => {
    if (!config.prometheus.enabled) {
        return;
    }

    await initializeMetrics();

    // prometheus metrics
    app.use(
        createMiddleware({
            app,
            options: {
                labels: ['environment'],
                metricPrefix: config.prometheus.prefix,
                metricTypes: ['httpRequestsTotal', 'httpRequestsSummary', 'httpRequestsHistogram'],
                getLabelValues: () => ({
                    environment: config.sentry.environment,
                }),
            },
        })
    );

    if (config.prometheus.external) {
        // serve metrics
        app.use(config.prometheus.externalPath, async (req, res) => {
            req.statusCode = 200;

            res.setHeader('Content-Type', getContentType());
            res.end(await getSummary());
        });
    }
};

export const startPrometheusServer = async () => {
    if (!config.prometheus.internal) {
        return () => Promise.resolve();
    }

    const server = await createServer({ port: config.prometheus.internalPort });

    return () =>
        new Promise(resolve => {
            server.close(resolve);
        });
};

export const ApolloMetricsPlugin: ApolloServerExpressConfig['plugins'][0] = {
    async requestDidStart() {
        return {
            async executionDidStart(requestContext) {
                return {
                    willResolveField({ info }) {
                        const start = process.hrtime();

                        return () => {
                            const [seconds, nanoseconds] = process.hrtime(start);
                            const duration = Math.round((seconds * 1e9 + nanoseconds) / 1e6);

                            global.apiHistogram.observe(
                                {
                                    environment: config.sentry.environment,
                                    key: info.fieldName,
                                    typename: info.path.typename,
                                    operation: info.operation.operation,
                                },
                                duration
                            );
                        };
                    },
                };
            },
        };
    },
};

export default setupPrometheusMetrics;

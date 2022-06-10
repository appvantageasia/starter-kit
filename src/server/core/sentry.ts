import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { Integration } from '@sentry/types';
import { ApolloError } from 'apollo-server';
import { ApolloServerExpressConfig } from 'apollo-server-express';
import { Express } from 'express';
import config from './config';

const { sentry: sentryConfig } = config;

export const initializeSentry = ({ app }: { app?: Express } = {}) => {
    if (!sentryConfig.dsn) {
        return;
    }

    const integrations: Integration[] = [new RewriteFrames()];

    const sentryInitOptions: Sentry.NodeOptions = {
        release: sentryConfig.release,
        dsn: sentryConfig.dsn,
        environment: sentryConfig.environment,
        maxValueLength: Infinity,
    };

    if (sentryConfig.tracing) {
        sentryInitOptions.tracesSampleRate = sentryConfig.tracesSampleRate;

        if (app) {
            integrations.push(new Tracing.Integrations.Express({ app }));
        }

        integrations.push(new Tracing.Integrations.Mongo());
    }

    sentryInitOptions.integrations = integrations;

    Sentry.init(sentryInitOptions);
};

export const ApolloSentryPlugin: ApolloServerExpressConfig['plugins'][0] = {
    async requestDidStart(_) {
        /* Within this returned object, define functions that respond
           to request-specific lifecycle events. */
        return {
            async didEncounterErrors(ctx) {
                // If we couldn't parse the operation, don't
                // do anything here
                if (!ctx.operation) {
                    return;
                }

                for (const error of ctx.errors) {
                    // Only report internal server errors,
                    // all errors extending ApolloError should be user-facing
                    if (error.originalError instanceof ApolloError) {
                        continue;
                    }

                    // also print it in console
                    console.error(error);

                    // Add scoped report details and send to Sentry
                    Sentry.withScope(scope => {
                        // Annotate whether failing operation was query/mutation/subscription
                        scope.setTag('kind', ctx.operation.operation);

                        // Log query and variables as extras (make sure to strip out sensitive data!)
                        scope.setExtra('query', ctx.request.query);
                        scope.setExtra('variables', ctx.request.variables);

                        if (error.path) {
                            // We can also add the path as breadcrumb
                            scope.addBreadcrumb({
                                category: 'query-path',
                                message: error.path.join(' > '),
                                level: 'debug',
                            });
                        }

                        Sentry.captureException(error);
                    });
                }
            },
        };
    },
};

import chalk from 'chalk';
import type { SMTPSettings } from '../emails';
import { getClientSideFieldLevelEncryptionSettings } from './encryption';
import { getString, getBoolean, getInteger, getNumber, getPrefix, getStringList } from './env';

const getSmtpSettings = (): SMTPSettings => {
    const base = {
        host: getString(getPrefix('SMTP_HOST'), 'localhost'),
        port: getInteger(getPrefix('SMTP_PORT'), 465),
        secure: getBoolean(getPrefix('SMTP_SECURE'), false),
    };

    const user = getString(getPrefix('SMTP_USER'));

    if (!user) {
        return base;
    }

    return {
        ...base,
        auth: {
            user,
            pass: getString(getPrefix('SMTP_PASSWORD')),
        },
    };
};

const version = getString('VERSION', '0.0.0-development');

const port = getNumber(getPrefix('PORT'), 3000);

const config = {
    version,

    // miscellaneous
    verbose: getBoolean(getPrefix('VERBOSE'), true),

    // introspection state on the GraphQL API
    introspection: getBoolean(getPrefix('INTROSPECTION'), process.env.NODE_ENV !== 'production'),

    debug: getBoolean('DEBUG', false),
    port,
    publicPath: getString(getPrefix('PUBLIC_PATH'), '/public/'),
    applicationEndpoint: getString(getPrefix('ENDPOINT'), `http://localhost:${port}`),

    // secure cookies
    cookiePolicy: getString(getPrefix('COOKIE_POLICY'), 'strict'),
    secureCookie: getBoolean(getPrefix('SECURE_COOKIE'), true),

    // health checks
    healthChecks: {
        enabled: getBoolean(getPrefix('HEALTH_ENABLED'), false),
        port: getNumber(getPrefix('HEALTH_PORT'), 4000),
        allowed: getStringList(getPrefix('HEALTH_ALLOWED'), ['::1/128', '127.0.0.0/8']),
        workerBeat: getString(getPrefix('HEALTH_WORKER_BEAT')),
    },

    // gzip module
    gzip: getBoolean(getPrefix('GZIP'), true),

    // internationalization
    i18n: {
        locales: ['en'],
    },

    // server runtime
    db: {
        uri: getString(getPrefix('DB_URI'), 'mongodb+srv://localhost:27017'),
        name: getString(getPrefix('DB_NAME'), 'app'),
        pool: getInteger(getPrefix('DB_POOL'), 10),

        // Client Side Field Level Encryption (CSFLE)
        // https://docs.mongodb.com/drivers/security/client-side-field-level-encryption-guide/
        encryption: getClientSideFieldLevelEncryptionSettings(),

        // mongocryptd settings
        // only used if encryption is enabled
        cryptd: {
            uri: getString(getPrefix('DB_CRYPTD_URI')),
            mongocryptdBypassSpawn: getBoolean(getPrefix('DB_CRYPTD_BYPASS_SPAWN'), false),
            mongocryptdSpawnArgs: getStringList(getPrefix('DB_CRYPTD_SPWAN_ARGS'), [], ' '),
        },
    },

    bull: {
        persistJobs: getBoolean(getPrefix('BULL_PERSIST'), false),
        enableMonitor: getBoolean(getPrefix('BULL_MONITOR'), false),
    },

    redis: {
        uri: getString(getPrefix('REDIS_URI'), 'redis://127.0.0.1:6379'),
    },

    session: {
        secret: getString(getPrefix('SESSION_SECRET')),
        lifetime: getString(getPrefix('SESSION_LIFETIME'), '1h'),
    },

    // default/system SMTP settings
    smtp: {
        transporter: getSmtpSettings(),
        sender: getString(getPrefix('SMTP_FROM'), 'noreply@appvantage.co'),
    },

    storage: {
        provider: {
            endPoint: getString(getPrefix('STORAGE_ENDPOINT')),
            accessKey: getString(getPrefix('STORAGE_ACCESS_KEY')),
            secretKey: getString(getPrefix('STORAGE_SECRET_KEY')),
            useSSL: getBoolean(getPrefix('STORAGE_SSL'), true),
            port: getInteger(getPrefix('STORAGE_PORT')),
            region: getString(getPrefix('STORAGE_REGION'), 'ap-southeast-1'),
        },
        bucket: getString(getPrefix('STORAGE_BUCKET'), 'app'),
    },

    sentry: {
        dsn: getString(getPrefix('SENTRY_DSN')),
        release: getString(getPrefix('SENTRY_RELEASE')),
        environment: getString(getPrefix('SENTRY_ENVIRONMENT')),
        tracing: getBoolean(getPrefix('SENTRY_TRACING'), true),
        tracesSampleRate: getNumber(getPrefix('SENTRY_TRACES_SAMPLE_RATE'), 1.0),
    },

    html2pdf: {
        endpoint: getString(getPrefix('HTML2PDF_ENDPOINT')),
    },

    limiter: {
        api: getNumber(getPrefix('LIMITER_API'), 1000),
    },

    prometheus: {
        enabled: getBoolean(getPrefix('PROMETHEUS_ENABLED'), false),
        internal: getBoolean(getPrefix('PROMETHEUS_INTERNAL'), false),
        internalPort: getInteger(getPrefix('PROMETHEUS_INTERNAL_PORT'), 7788),
        external: getBoolean(getPrefix('PROMETHEUS_EXTERNAL'), false),
        externalPath: getString(getPrefix('PROMETHEUS_EXTERNAL_PATH'), '/metrics'),
        prefix: getString(getPrefix('PROMETHEUS_PREFIX'), 'app_'),
    },
};

export type RuntimeConfig = typeof config;

const exitOnError = (error: string): void => {
    console.error(error);
    process.exit(1);
};

export const runValidityChecks = () => {
    if (!config.session.secret) {
        exitOnError(chalk.red('APP_SESSION_SECRET is missing in environment variables'));
    }

    if (config.bull.enableMonitor && process.env.NODE_ENV === 'production') {
        exitOnError(chalk.red('APP_BULL_MONITOR cannot be turned on on production environment'));
    }
};

export default config;

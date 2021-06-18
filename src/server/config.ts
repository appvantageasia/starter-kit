import chalk from 'chalk';
import { Region } from 'minio';
import { SMTPSettings } from './emails';
import { getString, getBoolean, getInteger, getNumber } from './env';

const prefix = 'APP';

const getPrefix = key => `${prefix}_${key}`;

export type RuntimeConfig = {
    version: string;

    port: number;

    publicPath: string;

    db: {
        uri: string;
        name: string;
        pool: number;
    };

    redis: {
        uri: string;
    };

    session: {
        secret: string;
        lifetime: string;
    };

    i18n: {
        locales: string[];
        defaultLocale: string;
    };

    smtp: {
        transporter: SMTPSettings;
        sender: string;
    };

    storage: {
        provider: {
            endPoint: string;
            accessKey: string;
            secretKey: string;
            useSSL?: boolean;
            port?: number;
            region: Region;
        };
        bucket: string;
    };

    sentry: {
        dsn?: string;
        release?: string;
        environment?: string;
        tracing: boolean;
        tracesSampleRate: number;
    };

    html2pdf: {
        endpoint: string;
    };
};

const getSmtpSettings = (): RuntimeConfig['smtp']['transporter'] => {
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

const config: RuntimeConfig = {
    version,

    port: getNumber(getPrefix('PORT'), 3000),
    publicPath: getString(getPrefix('PUBLIC_PATH'), '/public/'),

    // internationalization
    i18n: {
        locales: ['en'],
        defaultLocale: 'en',
    },

    // server runtime
    db: {
        uri: getString(getPrefix('DB_URI'), 'mongodb+srv://localhost:27017'),
        name: getString(getPrefix('DB_NAME'), 'app'),
        pool: getInteger(getPrefix('DB_POOL'), 10),
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
};

const exitOnError = (error: string): void => {
    console.error(error);
    process.exit(1);
};

export const runValidityChecks = () => {
    if (!config.session.secret) {
        exitOnError(chalk.red('APP_SESSION_SECRET is missing in environment variables'));
    }
};

export default config;

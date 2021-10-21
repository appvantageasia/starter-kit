# Settings

All settings are defined through environment variable.

## Global configuration

| Name              | Type    | Default           | Comment                    |
| ----------------- | ------- | ----------------- | -------------------------- |
| VERSION           | String  | 0.0.0-development | Application version        |
| APP_PUBLIC_PATH   | String  | /public/          | Public path for assets     |
| APP_PORT          | Number  | 3000              | HTTP server listening port |
| APP_GZIP          | Boolean | true              | Enable GZip compression    |
| APP_SECURE_COOKIE | Boolean | true              | Enable secure cookies      |
| APP_COOKIE_POLICY | String  | strict            | Cookie sameSite policy     |

It's recommended to disable compression if you may delegate it to a reverse proxy.

## Database configuration

| Name        | Type   | Default                       | Comment                    |
| ----------- | ------ | ----------------------------- | -------------------------- |
| APP_DB_URI  | String | mongodb+srv://localhost:27017 | Database connection string |
| APP_DB_NAME | String | app                           | Database Name              |
| APP_DB_POOL | Number | 10                            | Database pool size         |

## Redis configuration

| Name          | Type   | Default                | Comment                 |
| ------------- | ------ | ---------------------- | ----------------------- |
| APP_REDIS_URI | String | redis://127.0.0.1:6379 | Redis connection string |

## Session configuration

| Name                 | Type   | Default | Comment                                        |
| -------------------- | ------ | ------- | ---------------------------------------------- |
| APP_SESSION_SECRET   | String |         | Secret use for JWT signature on session tokens |
| APP_SESSION_LIFETIME | String | 1h      | Session token lifetime                         |

## SMTP configuration

| Name              | Type    | Default               | Comment                           |
| ----------------- | ------- | --------------------- | --------------------------------- |
| APP_SMTP_HOST     | String  | localhost             | SMTP host                         |
| APP_SMTP_PORT     | Number  | 465                   | SMTP Port                         |
| APP_SMTP_SECURE   | Boolean | false                 | SMTP transport on secure mode     |
| APP_SMTP_USER     | String  |                       | SMTP user                         |
| APP_SMTP_PASSWORD | String  |                       | SMTP password                     |
| APP_SMTP_FROM     | String  | noreply@appvantage.co | Default sender on outgoing emails |

## Storage configuration

| Name                   | Type    | Default        | Comment                                  |
| ---------------------- | ------- | -------------- | ---------------------------------------- |
| APP_STORAGE_ENDPOINT   | String  |                | API endpoint for the Object storage      |
| APP_STORAGE_ACCESS_KEY | String  |                | Access Key for object storage            |
| APP_STORAGE_SECRET_KEY | String  |                | Secret Key for object storage            |
| APP_STORAGE_SSL        | Boolean | true           | Use TLS with the object storage          |
| APP_STORAGE_PORT       | Number  |                | Port on which the API endpoint is served |
| APP_STORAGE_REGION     | String  | ap-southeast-1 | Object storage region                    |
| APP_STORAGE_BUCKET     | String  | app            | Bucket name for the object storage       |

## Sentry configuration

| Name                          | Type    | Default | Comment                               |
| ----------------------------- | ------- | ------- | ------------------------------------- |
| APP_SENTRY_DSN                | String  |         | Sentry DSN                            |
| APP_SENTRY_RELEASE            | String  |         | Sentry version                        |
| APP_SENTRY_ENVIRONMENT        | String  |         | Sentry environment                    |
| APP_SENTRY_TRACING            | Boolean | true    | Enable Sentry tracing                 |
| APP_SENTRY_TRACES_SAMPLE_RATE | Number  | 1.0     | Sentry traces sample rate for tracing |

## HTML2PDF configuration

| Name                  | Type   | Default | Comment                       |
| --------------------- | ------ | ------- | ----------------------------- |
| APP_HTML2PDF_ENDPOINT | String |         | Endpoint for the html2pdf API |

## Limiter configuration

| Name            | Type   | Default | Comment                                   |
| --------------- | ------ | ------- | ----------------------------------------- |
| APP_LIMITER_API | Number | 1000    | Rate limiter per second per IP on the API |

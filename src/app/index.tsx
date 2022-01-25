import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import createApolloClient from './createApolloClient';
import { RuntimeConfig } from './runtimeConfig';
import createI18Instance from './utilities/createI18nInstance';

const runtimeConfig = JSON.parse(
    document.querySelector('script[data-role="runtime-config"]').textContent
) as RuntimeConfig;

const { i18n } = createI18Instance(runtimeConfig.publicPath, {
    currentLocale: runtimeConfig.defaultLocale,
    i18n: {
        defaultLocale: runtimeConfig.defaultLocale,
        locales: runtimeConfig.locales,
    },
});

if (runtimeConfig.sentry.dsn) {
    const sentryInitOptions: Sentry.BrowserOptions = {
        dsn: runtimeConfig.sentry.dsn,
        release: runtimeConfig.sentry.release,
        environment: runtimeConfig.sentry.environment,
        integrations: [new Integrations.BrowserTracing()],
    };

    if (runtimeConfig.sentry.tracing) {
        sentryInitOptions.tracesSampleRate = runtimeConfig.sentry.tracesSampleRate;
        sentryInitOptions.integrations = [new Integrations.BrowserTracing()];
    }

    Sentry.init(sentryInitOptions);
}

const element = (
    <BrowserRouter>
        <App createApolloClient={createApolloClient} i18n={i18n} runtime={runtimeConfig} />
    </BrowserRouter>
);

const container = document.getElementById('root');

if (runtimeConfig.withSSR) {
    hydrateRoot(container, element);
} else {
    createRoot(container).render(element);
}

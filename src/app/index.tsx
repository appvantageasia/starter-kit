import { hydrate } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import createI18Instance from '../shared/createI18nInstance/browser';
import App from './App';
import { RuntimeConfig } from './runtimeConfig';

const runtimeConfig = JSON.parse(
    document.querySelector('script[data-role="runtime-config"]').textContent
) as RuntimeConfig;

const { i18n } = createI18Instance({
    currentLocale: runtimeConfig.defaultLocale,
    i18n: {
        defaultLocale: runtimeConfig.defaultLocale,
        locales: runtimeConfig.locales,
    },
});

const element = (
    <BrowserRouter>
        <App i18n={i18n} runtime={runtimeConfig} />
    </BrowserRouter>
);

const container = document.getElementById('root');

hydrate(element, container);

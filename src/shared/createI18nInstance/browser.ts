import i18n from 'i18next';
import i18nextHTTPBackend from 'i18next-http-backend';
import defaultConfig from './defaultConfig';
import { InternalConfig, CreateClientReturn } from './types';

export default (config: InternalConfig): CreateClientReturn => {
    const instance = i18n.createInstance();

    instance.use(i18nextHTTPBackend);

    const initPromise = instance.init({
        ...defaultConfig,
        lng: config.currentLocale || config.i18n.defaultLocale,
        supportedLngs: config.i18n.locales,
    });

    return { i18n: instance, initPromise };
};

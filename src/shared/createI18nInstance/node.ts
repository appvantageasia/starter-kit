import path from 'path';
import i18n from 'i18next';
import i18nextFSBackend from 'i18next-fs-backend';
import defaultConfig from './defaultConfig';
import { InternalConfig, CreateClientReturn } from './types';

export default (config: InternalConfig): CreateClientReturn => {
    const instance = i18n.createInstance();

    instance.use(i18nextFSBackend);

    const initPromise = instance.init({
        ...defaultConfig,
        lng: config.currentLocale || config.i18n.defaultLocale,
        supportedLngs: config.i18n.locales,

        backend: {
            loadPath: path.resolve(process.cwd(), './public/locales/{{lng}}/{{ns}}.json'),
            addPath: path.resolve(process.cwd(), './public/locales/{{lng}}/{{ns}}.missing.json'),
        },
    });

    return { i18n: instance, initPromise };
};

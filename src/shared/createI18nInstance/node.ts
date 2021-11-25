import path from 'path';
import i18n, { i18n as I18n } from 'i18next';
import i18nextFSBackend from 'i18next-fs-backend';
import config from '../../server/core/config';
import { getDefaultLocale } from '../../server/database';
import defaultConfig from './defaultConfig';
import { CreateClientReturn } from './types';

let cachedInstance: Promise<I18n> | null = null;

const localesDirectory = path.resolve(process.cwd(), './public/locales/');

const createInstance = async () => {
    const instance = i18n.createInstance({
        ...defaultConfig,
        lng: await getDefaultLocale(),
        supportedLngs: config.i18n.locales,

        backend: {
            loadPath: path.join(localesDirectory, '/{{lng}}/{{ns}}.json'),
            addPath: path.join(localesDirectory, '/{{lng}}/{{ns}}.missing.json'),
        },
    });

    instance.use(i18nextFSBackend);

    await instance.init();

    return instance;
};

export default async (language?: string): Promise<CreateClientReturn> => {
    if (!cachedInstance) {
        cachedInstance = createInstance();
    }

    const instance = (await cachedInstance).cloneInstance();

    if (language && config.i18n.locales.includes(language)) {
        instance.changeLanguage(language);
    }

    const initPromise = instance.init();

    return { i18n: instance, initPromise };
};

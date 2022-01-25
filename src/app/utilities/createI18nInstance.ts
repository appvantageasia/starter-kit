import dayjs from 'dayjs';
import i18n, { TFunction, i18n as I18n } from 'i18next';
import i18nextHTTPBackend from 'i18next-http-backend';
import join from 'url-join';

export type CreateClientReturn = { i18n: I18n; initPromise: Promise<TFunction> };

export type InternalConfig = {
    currentLocale?: string;

    i18n: {
        locales: string[];
        defaultLocale: string;
    };
};

export default (publicPath: string, config: InternalConfig): CreateClientReturn => {
    const instance = i18n.createInstance();

    instance.use(i18nextHTTPBackend);

    const initPromise = instance.init({
        defaultNS: 'common',
        ns: [],
        load: 'currentOnly',
        lng: config.currentLocale || config.i18n.defaultLocale,
        supportedLngs: config.i18n.locales,

        interpolation: {
            escapeValue: false,
            format: (value: any, format: string) => {
                if (value instanceof Date) {
                    return dayjs(value).format(format);
                }

                return value;
            },
            formatSeparator: ',',
        },

        backend: {
            loadPath: join(publicPath, 'locales/{{lng}}/{{ns}}.json'),
        },

        react: {
            useSuspense: true,
        },
    });

    return { i18n: instance, initPromise };
};

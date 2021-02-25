import { TFunction, i18n } from 'i18next';

export type InitPromise = Promise<TFunction>;

export type I18n = i18n;

export type CreateClientReturn = { i18n: I18n; initPromise: InitPromise };

export type InternalConfig = {
    currentLocale?: string;

    i18n: {
        locales: string[];
        defaultLocale: string;
    };
};

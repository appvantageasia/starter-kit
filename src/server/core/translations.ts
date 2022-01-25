import { IncomingMessage } from 'http';
import languageParser from 'accept-language-parser';
import { i18n, TFunction } from 'i18next';
import { getDefaultLocale } from '../database';
import createI18nInstance from '../utils/createI18nInstance';
import config from './config';

export type I18nContext = { i18n: i18n; t: TFunction };

export type GetTranslations = (namespaces?: string[]) => Promise<I18nContext>;

export const getLazyTranslations = (language: string): GetTranslations => {
    let instance: I18nContext = null;
    let promise: Promise<I18nContext> = null;

    const getter = async (namespaces?: string[]): Promise<I18nContext> => {
        if (instance) {
            if (namespaces) {
                await instance.i18n.loadNamespaces(namespaces);
            }

            return instance;
        }

        if (!promise) {
            promise = new Promise((resolve, reject) => {
                createI18nInstance(language)
                    .then(({ i18n, initPromise }) =>
                        initPromise.then(t => {
                            // update the instance on local scope
                            instance = { i18n, t };
                            // set promise back to null
                            promise = null;

                            resolve(instance);
                        })
                    )
                    .catch(reject);
            });
        }

        // first wait for it to be resolved
        await promise;

        // and retry
        return getter(namespaces);
    };

    return getter;
};

export const getLanguage = (req: IncomingMessage): Promise<string> => {
    const detectedLanguage = languageParser.pick(config.i18n.locales, req.headers['accept-language']);

    if (detectedLanguage) {
        return Promise.resolve(detectedLanguage);
    }

    return getDefaultLocale();
};

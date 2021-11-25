import dayjs from 'dayjs';
import { Binary } from 'mongodb';
import config from '../../core/config';
import { getRegularClient } from '../client';
import { getCollections } from '../collections';
import { DefaultLocaleSetting, SettingId, EncryptionKeyIdSetting } from '../documents';
import { getDatabaseContext } from '../instance';

const withLocalCache = <Output>(getter: () => Promise<Output>) => {
    // cache holder
    let cache:
        | { resolved: false; promise: Promise<Output> }
        | { resolved: true; value: Output; validUntil: Date }
        | null = null;

    return () => {
        if (cache) {
            if (cache.resolved === false) {
                // simply return the promise
                return cache.promise;
            }

            // verify validity
            if (new Date() <= cache.validUntil) {
                return Promise.resolve(cache.value);
            }
        }

        // instance the promise and wait for its resolution
        const promise = getter()
            .then(value => {
                // update cache
                // valid for 10s
                cache = { resolved: true, value, validUntil: dayjs().add(10, 's').toDate() };

                return value;
            })
            .catch(error => {
                // print the error
                console.error(error);
                // empty cache
                cache = null;

                // throw it back
                return Promise.reject(error);
            });

        // update cache
        cache = { resolved: false, promise };

        return promise;
    };
};

export const getDefaultLocale = withLocalCache(async () => {
    const { collections } = await getDatabaseContext();
    const setting = (await collections.settings.findOne({
        settingId: SettingId.DefaultLocale,
    })) as DefaultLocaleSetting;

    if (!setting) {
        // return english by default
        return 'en';
    }

    return setting.locale;
});

export const getEncryptionKeyId = async () => {
    // encryption may be applied on the settings
    // however this specific cannot be encrypted as it's required for encryption
    // it may not use the cached mongodb as well
    // so we first get a regular client
    const client = await getRegularClient();

    try {
        // then get the database and collections
        const regular = { client, db: client.db(config.db.name) };
        const collections = getCollections({ regular, encrypted: regular });

        // get the setting we are looking for
        const setting = (await collections.settings.findOne({
            settingId: SettingId.EncryptionKeyId,
        })) as EncryptionKeyIdSetting;

        if (!setting) {
            // return null to inform we don't have any
            return null;
        }

        return new Binary(Buffer.from(setting.keyId, 'base64'), 4);
    } finally {
        // close the client
        await client.close();
    }
};

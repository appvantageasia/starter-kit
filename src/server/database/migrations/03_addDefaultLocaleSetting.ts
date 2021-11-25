import { ObjectId } from 'mongodb';
import { DatabaseContext } from '../instance';

export default {
    identifier: '03_addDefaultLocaleSetting',

    async up({ encrypted: { db } }: DatabaseContext): Promise<void> {
        // first ensure setting ID are unique
        await db.collection('settings').createIndex({ settingId: 1 }, { unique: true });

        // then add default locale to be english
        await db.collection('settings').insertOne({
            _id: new ObjectId(),
            settingId: 'defaultLocale',
            date: new Date(),
            locale: 'en',
        });
    },
};

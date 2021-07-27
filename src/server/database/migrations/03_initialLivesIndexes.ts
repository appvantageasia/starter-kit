import { Db } from 'mongodb';

export default {
    identifier: '03_initialLivesIndexes',

    async up(db: Db): Promise<void> {
        await db.collection('lives').createIndex({ firstName: 1, lastName: 1 }, { unique: true });
    },
};

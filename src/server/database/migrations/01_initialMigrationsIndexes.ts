import { Db } from 'mongodb';

export default {
    identifier: '01_initialMigrationsIndexes',

    async up(db: Db): Promise<void> {
        await db.collection('migrations').createIndex({ identifier: 1 }, { unique: true });
    },
};

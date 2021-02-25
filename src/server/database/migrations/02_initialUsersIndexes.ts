import { Db } from 'mongodb';

export default {
    identifier: '02_initialUsersIndexes',

    async up(db: Db): Promise<void> {
        await db.collection('users').createIndex({ username: 1 }, { unique: true });
    },
};

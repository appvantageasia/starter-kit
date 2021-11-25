import { DatabaseContext } from '../instance';

export default {
    identifier: '02_initialUsersIndexes',

    async up({ regular: { db } }: DatabaseContext): Promise<void> {
        await db.collection('users').createIndex({ username: 1 }, { unique: true });
    },
};

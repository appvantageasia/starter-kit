import { DatabaseContext } from '../instance';

export default {
    identifier: '05_initialUserSessionIndexes',

    async up({ regular: { db } }: DatabaseContext): Promise<void> {
        await db.collection('userSessions').createIndex({ userId: 1 });
        await db.collection('userSessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    },
};

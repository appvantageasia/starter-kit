import { DatabaseContext } from '../instance';

export default {
    identifier: '06_initialUserWebCredentialsIndexes',

    async up({ regular: { db } }: DatabaseContext): Promise<void> {
        await db.collection('userWebCredentials').createIndex({ userId: 1 });
        await db.collection('userWebCredentials').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    },
};

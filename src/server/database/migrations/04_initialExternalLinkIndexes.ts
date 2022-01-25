import { DatabaseContext } from '../instance';

export default {
    identifier: '04_initialExternalLinkIndexes',

    async up({ regular: { db } }: DatabaseContext): Promise<void> {
        await db.collection('externalLinks').createIndex({ secret: 1 }, { unique: true });
        await db.collection('externalLinks').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    },
};

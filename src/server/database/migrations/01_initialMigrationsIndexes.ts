import { DatabaseContext } from '../instance';

export default {
    identifier: '01_initialMigrationsIndexes',

    async up({ regular: { db } }: DatabaseContext): Promise<void> {
        await db.collection('migrations').createIndex({ identifier: 1 }, { unique: true });
    },
};

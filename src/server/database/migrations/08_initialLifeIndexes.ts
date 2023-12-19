import { DatabaseContext } from '../instance';

export default {
    identifier: '08_initialLifeIndexes',

    async up({ regular: { db } }: DatabaseContext): Promise<void> {
        await db.collection('lives').createIndex({ firstName: 1, lastName: 1 }, { unique: true });
    },
};
import { DatabaseContext } from '../instance';

export default {
    identifier: '07_addSingleSessionMode',

    async up({ regular: { db } }: DatabaseContext): Promise<void> {
        await db.collection('users').updateMany({}, { $set: { singleSessionMode: true } });
    },
};

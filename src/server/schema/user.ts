import { ObjectId } from 'mongodb';
import { getDatabaseContext, User } from '../database';

export type GetLoggedUser = () => Promise<User | null>;

export const getUser = async (userId: ObjectId): Promise<User | null> => {
    const { collections } = await getDatabaseContext();

    return collections.users.findOne({ _id: userId });
};

export const getLazyLoggedUser = (userId: ObjectId | null): GetLoggedUser => {
    if (!userId) {
        return () => Promise.resolve(null);
    }

    let instance = null;
    let promise = null;

    return async (): Promise<User | null> => {
        if (instance) {
            return instance;
        }

        if (promise) {
            return promise;
        }

        promise = getUser(userId);

        instance = await promise;

        return instance;
    };
};

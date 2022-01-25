import { AuthenticationError } from 'apollo-server';
import { ObjectId } from 'mongodb';
import { getDatabaseContext, User } from '../database';

export const getUser = async (userId: ObjectId): Promise<User | null> => {
    const { collections } = await getDatabaseContext();

    return collections.users.findOne({ _id: userId });
};

export const getLazyLoggedUser = (userId: ObjectId | null | undefined) => {
    let instance: User | null | undefined;
    let promise: Promise<User | null> | undefined;

    const getUserFromPromise = (): Promise<User | null> => {
        if (!userId) {
            return Promise.resolve(null);
        }

        if (instance !== undefined) {
            return Promise.resolve(instance);
        }

        if (promise === undefined) {
            // create the promise
            promise = getUser(userId);
        }

        return promise;
    };

    /* eslint-disable no-redeclare */
    function getLoggedUser(optional: true): Promise<User | null>;
    function getLoggedUser(optional?: false): Promise<User>;
    function getLoggedUser(optional?: boolean): Promise<User> | Promise<User | null> {
        return getUserFromPromise().then(user => {
            if (!optional && !user) {
                throw new AuthenticationError('Not authenticated');
            }

            return user;
        });
    }
    /* eslint-enable no-redeclare */

    return getLoggedUser;
};

export type GetLoggedUser = ReturnType<typeof getLazyLoggedUser>;

import DataLoader from 'dataloader';
import { ObjectId } from 'mongodb';
import { getDatabaseContext, User } from '../database';
import { buildOneToOneLoader } from './helpers';

export type UserLoaders = {
    userById: DataLoader<ObjectId, User>;
};

const createUserLoaders = (): UserLoaders => {
    const userById = buildOneToOneLoader<User>(keys =>
        getDatabaseContext().then(({ collections }) => collections.users.find({ _id: { $in: keys } }).toArray())
    );

    return { userById };
};

export default createUserLoaders;

import { ObjectId } from 'mongodb';
import { getDatabaseContext, Topic } from '../../../database';
import { RootResolver } from '../../context';

type Args = { id: ObjectId };

const query: RootResolver<Args> = async (root, { id }): Promise<Topic | null> => {
    const { collections } = await getDatabaseContext();

    return collections.topics.findOne({ _id: id });
};

export default query;

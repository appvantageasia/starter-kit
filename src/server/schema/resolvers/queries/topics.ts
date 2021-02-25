import { getDatabaseContext, Topic } from '../../../database';
import { RootResolver } from '../../context';

const query: RootResolver = async (): Promise<Topic[]> => {
    const { collections } = await getDatabaseContext();

    return collections.topics.find({}, { sort: { updatedAt: -1 } }).toArray();
};

export default query;

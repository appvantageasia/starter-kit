import { getDatabaseContext } from '../../../database';
import { GraphQLQueryResolvers } from '../definitions';

const query: GraphQLQueryResolvers['topic'] = async (root, { id }) => {
    const { collections } = await getDatabaseContext();

    return collections.topics.findOne({ _id: id });
};

export default query;

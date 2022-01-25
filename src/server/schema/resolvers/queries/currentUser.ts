import { GraphQLQueryResolvers } from '../definitions';

const query: GraphQLQueryResolvers['currentUser'] = async (root, args, { getUser }) => getUser(true);

export default query;

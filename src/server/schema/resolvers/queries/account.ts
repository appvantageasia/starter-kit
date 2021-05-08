import { GraphQLQueryResolvers } from '../definitions';

const query: GraphQLQueryResolvers['account'] = async (root, args, { getUser }) => getUser();

export default query;

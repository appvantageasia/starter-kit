import { GraphQLTopicMessageResolvers } from '../definitions';

const TopicMessageGraphQL: GraphQLTopicMessageResolvers = {
    id: root => root._id,
    author: (root, args, { loaders }) => loaders.userById.load(root.authorId),
};

export default TopicMessageGraphQL;

import { GraphQLTopicResolvers } from '../definitions';

const TopicGraphQL: GraphQLTopicResolvers = {
    id: root => root._id,
    messagesCount: root => root.messages.length,
    author: (root, args, { loaders }) => loaders.userById.load(root.authorId),
};

export default TopicGraphQL;

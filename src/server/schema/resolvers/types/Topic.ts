import { Topic } from '../../../database';
import { TypeResolver } from '../../context';

const TopicGraphQL: TypeResolver<Topic> = {
    id: root => root._id,
    messagesCount: root => root.messages.length,
    author: (root, args, { loaders }) => loaders.userById.load(root.authorId),
};

export default TopicGraphQL;

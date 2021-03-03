import { TopicMessage } from '../../../database';
import { TypeResolver } from '../../context';

const TopicMessageGraphQL: TypeResolver<TopicMessage> = {
    id: root => root._id,
    author: (root, args, { loaders }) => loaders.userById.load(root.authorId),
};

export default TopicMessageGraphQL;

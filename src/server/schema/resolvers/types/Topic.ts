import { getDatabaseContext, Topic, User } from '../../../database';
import { TypeResolver } from '../../context';

const TopicGraphQL: TypeResolver<Topic> = {
    id: root => root._id,
    messagesCount: root => root.messages.length,
    author: async (root): Promise<User> => {
        const { collections } = await getDatabaseContext();

        return collections.users.findOne({ _id: root.authorId });
    },
};

export default TopicGraphQL;

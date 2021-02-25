import { getDatabaseContext, TopicMessage, User } from '../../../database';
import { TypeResolver } from '../../context';

const TopicMessageGraphQL: TypeResolver<TopicMessage> = {
    id: root => root._id,
    author: async (root): Promise<User> => {
        const { collections } = await getDatabaseContext();

        return collections.users.findOne({ _id: root.authorId });
    },
};

export default TopicMessageGraphQL;

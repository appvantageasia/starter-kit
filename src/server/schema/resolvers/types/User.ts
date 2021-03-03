import { User } from '../../../database';
import { TypeResolver } from '../../context';
import { InvalidPermission } from '../../errors';

const UserGraphQL: TypeResolver<User> = {
    id: root => root._id,
    username: async (root, args, { getUser }) => {
        const user = await getUser();

        if (root._id.equals(user?._id)) {
            return root.username;
        }

        throw new InvalidPermission();
    },
    topics: (root, args, { loaders }) => loaders.topicById.load(root._id),
};

export default UserGraphQL;

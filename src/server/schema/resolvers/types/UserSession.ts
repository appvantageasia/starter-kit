import { getFriendlyUserAgent } from '../../../utils/userAgent';
import { GraphQLUserSessionResolvers } from '../definitions';

const UserSessionGraphQL: GraphQLUserSessionResolvers = {
    id: root => root._id,
    userAgent: root => getFriendlyUserAgent(root.userAgent),
};

export default UserSessionGraphQL;

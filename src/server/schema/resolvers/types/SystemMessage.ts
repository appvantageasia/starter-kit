import { GraphQLSystemMessageResolvers } from '../definitions';

const SystemMessageGraphQL: GraphQLSystemMessageResolvers = {
    __resolveType: parent => {
        switch (parent.type) {
            case 'systemNotice':
                return 'MessageNotice';

            case 'userSessionRevoked':
                return 'UserSessionRevoked';

            default:
                throw new Error('System Message not supported');
        }
    },
};

export default SystemMessageGraphQL;

import { ExternalLinkKind } from '../../../database';
import { GraphQLExternalLinkResolvers } from '../definitions';

const ExternalLinkGraphQL: GraphQLExternalLinkResolvers = {
    __resolveType: parent => {
        switch (parent._kind) {
            case ExternalLinkKind.ResetPassword:
                return 'ResetPasswordLink';

            default:
                throw new Error('External link kind not supported');
        }
    },
};

export default ExternalLinkGraphQL;

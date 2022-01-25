import { generateToken } from '../../../core/tokens';
import { GraphQLResetPasswordLinkResolvers } from '../definitions';

const ResetPasswordLinkGraphQL: GraphQLResetPasswordLinkResolvers = {
    token: parent =>
        generateToken(
            'resetPassword',
            {
                userId: parent.data.userId,
                linkId: parent._id,
            },
            10 * 60
        ),
};

export default ResetPasswordLinkGraphQL;

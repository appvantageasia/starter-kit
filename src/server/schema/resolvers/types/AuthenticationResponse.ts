import { GraphQLAuthenticationResponseResolvers } from '../definitions';
import { AuthenticationStep } from '../typings';

const AuthenticationResponseGraphQL: GraphQLAuthenticationResponseResolvers = {
    __resolveType: parent => {
        switch (parent._kind) {
            case AuthenticationStep.PasswordChange:
                return 'AuthenticationRequiresNewPassword';

            case AuthenticationStep.Successful:
                return 'AuthenticationSuccessful';

            case AuthenticationStep.TOTP:
                return 'AuthenticationRequiresTOTP';

            default:
                throw new Error('Authentication step not supported');
        }
    },
};

export default AuthenticationResponseGraphQL;

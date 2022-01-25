import { getDatabaseContext, UserWebAuthnCredential } from '../../../database';
import { GraphQLQueryResolvers } from '../definitions';
import { checkWebAuthnLimiters } from './generateAuthenticatorChallenge';

const query: GraphQLQueryResolvers['getWebauthnKeys'] = async (root, { username }, { ip }) => {
    const limits = await checkWebAuthnLimiters(username, ip);

    if (limits.isBlocked) {
        return [];
    }

    const { collections } = await getDatabaseContext();

    // fetch the user
    const user = await collections.users.findOne({ username });

    if (!user) {
        await limits.consume();

        return [];
    }

    const keys = (await collections.userWebCredentials
        .find({ type: 'fido2', userId: user._id })
        .toArray()) as UserWebAuthnCredential[];

    return keys.map(key => key.credentialId);
};

export default query;

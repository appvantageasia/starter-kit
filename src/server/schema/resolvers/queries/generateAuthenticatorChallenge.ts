import { ObjectId } from 'mongodb';
import { authenticationRateLimiter, webAuthnKeyFetchRateLimiter } from '../../../core/rateLimiter';
import { csrfGenerator, generateToken } from '../../../core/tokens';
import { getDatabaseContext, UserWebAuthnCredential } from '../../../database';
import { getAssertion } from '../../../utils/webAuthn';
import { GraphQLQueryResolvers } from '../definitions';

export const checkWebAuthnLimiters = async (username: string, ip = 'unknown-ip') => {
    const usernameLimit = await webAuthnKeyFetchRateLimiter.get(username);
    const ipLimit = await webAuthnKeyFetchRateLimiter.get(ip);

    return {
        isBlocked: (usernameLimit && usernameLimit.remainingPoints <= 0) || (ipLimit && ipLimit.remainingPoints <= 0),
        consume: async () => {
            // consume 2 points for a maximum of 5 tries per minute
            await authenticationRateLimiter.penalty(username, 2);
            // consume 1 point for a maximum of 10 tries per minutes
            await authenticationRateLimiter.penalty(ip, 1);
        },
    };
};

const query: GraphQLQueryResolvers['generateAuthenticatorChallenge'] = async (root, { username }, { ip, setCSRF }) => {
    const limits = await checkWebAuthnLimiters(username, ip);

    // with this API will always consume
    await limits.consume();

    if (limits.isBlocked) {
        return null;
    }

    const { collections } = await getDatabaseContext();

    // fetch the user
    const user = await collections.users.findOne({ username });

    if (!user) {
        return null;
    }

    const keys = (await collections.userWebCredentials
        .find({ type: 'fido2', userId: user._id })
        .toArray()) as UserWebAuthnCredential[];

    if (keys.length === 0) {
        return null;
    }

    const options = await getAssertion();

    const csrf = csrfGenerator();
    const token = generateToken<{ challenge: string; userId: ObjectId }>(
        'webPublicKeyCredentialAuthentication',
        { challenge: options.challenge, userId: user._id },
        10 * 60,
        csrf
    );

    // update the CSRF cookie as well
    setCSRF(csrf);

    return {
        ...options,
        token,
        allowCredentials: keys.map(key => ({
            id: key.credentialId,
            type: 'public-key',
        })),
    };
};

export default query;

import { compare } from 'bcryptjs';
import { authenticationRateLimiter } from '../../../core/rateLimiter';
import { getDatabaseContext } from '../../../database';
import { InvalidInput } from '../../errors';
import { getSessionToken } from '../../session';
import { GraphQLMutationResolvers } from '../definitions';

const mutation: GraphQLMutationResolvers['authenticate'] = async (
    root,
    { username, password },
    { getTranslations, ip, setCSRF }
) => {
    const { t } = await getTranslations(['errors']);

    // get current limiters
    const usernameLimit = await authenticationRateLimiter.get(username);
    const ipLimit = await authenticationRateLimiter.get(ip);

    if ((usernameLimit && usernameLimit.remainingPoints <= 0) || (ipLimit && ipLimit.remainingPoints <= 0)) {
        // maximum tries reached
        throw new InvalidInput({ password: t('errors:invalidCredentials') });
    }

    const reject = async (): Promise<never> => {
        // consume 2 points for a maximum of 5 tries per minute
        await authenticationRateLimiter.penalty(username, 2);
        // consume 1 point for a maximum of 10 tries per minutes
        await authenticationRateLimiter.penalty(ip, 1);

        throw new InvalidInput({ password: t('errors:invalidCredentials') });
    };

    const { collections } = await getDatabaseContext();

    // get the user account
    const user = await collections.users.findOne({ username });

    if (!user) {
        return reject();
    }

    const isValid = await compare(password, user.password);

    if (!isValid) {
        return reject();
    }

    const { token, csrf } = await getSessionToken({ userId: user._id });

    // update cookies
    setCSRF(csrf);

    return { user, token };
};

export default mutation;

import { compare } from 'bcryptjs';
import { getDatabaseContext, User } from '../../../database';
import { authenticationRateLimiter } from '../../../rateLimiter';
import { RootResolver } from '../../context';
import { InvalidInput } from '../../errors';
import { getSessionToken } from '../../session';

type Args = { username: string; password: string };

type Output = { user: User; token: string };

const mutation: RootResolver<Args> = async (root, { username, password }, { getTranslations, ip }): Promise<Output> => {
    const { t } = await getTranslations(['errors']);

    try {
        // consume 2 points for a maximum of 5 tries per minute
        await authenticationRateLimiter.consume(username, 2);
        // consume 1 point for a maximum of 10 tries per minutes
        await authenticationRateLimiter.consume(ip, 1);
    } catch (error) {
        // maximum tries reached
        throw new InvalidInput({ password: t('errors:invalidCredentials') });
    }

    const { collections } = await getDatabaseContext();

    // get the user account
    const user = await collections.users.findOne({ username });

    if (!user) {
        throw new InvalidInput({ password: t('errors:invalidCredentials') });
    }

    const isValid = await compare(password, user.password);

    if (!isValid) {
        throw new InvalidInput({ password: t('errors:invalidCredentials') });
    }

    const token = await getSessionToken({ userId: user._id });

    return { user, token };
};

export default mutation;

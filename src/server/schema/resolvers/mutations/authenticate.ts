import { compare } from 'bcryptjs';
import { getDatabaseContext, User } from '../../../database';
import { RootResolver } from '../../context';
import { InvalidInput } from '../../errors';
import { getSessionToken } from '../../session';

type Args = { username: string; password: string };

type Output = { user: User; token: string };

const mutation: RootResolver<Args> = async (root, { username, password }, { getTranslations }): Promise<Output> => {
    const { collections } = await getDatabaseContext();
    const { t } = await getTranslations(['errors']);

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

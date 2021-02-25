import { genSalt, hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import zxcvbn from 'zxcvbn';
import { getDatabaseContext, User } from '../../../database';
import { RootResolver } from '../../context';
import { InvalidInput } from '../../errors';

type Args = { username: string; password: string };

const cryptPassword = async (password: string) => {
    const salt = await genSalt(10);

    return hash(password, salt);
};

const mutation: RootResolver<Args> = async (root, { username, password }, { getTranslations }): Promise<User> => {
    const { collections } = await getDatabaseContext();
    const { t } = await getTranslations(['errors']);

    const passwordReview = zxcvbn(password, [username]);

    if (passwordReview.score < 3) {
        throw new InvalidInput({ password: t('errors:weakPassword') });
    }

    const document: User = {
        _id: new ObjectId(),
        username,
        displayName: username,
        password: await cryptPassword(password),
    };

    await collections.users.insertOne(document);

    return document;
};

export default mutation;

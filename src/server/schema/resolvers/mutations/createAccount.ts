import { genSalt, hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import zxcvbn from 'zxcvbn';
import { getDatabaseContext, User } from '../../../database';
import { isDuplicateErrorOnFields } from '../../../utils';
import { InvalidInput } from '../../errors';
import { GraphQLMutationResolvers } from '../definitions';

const cryptPassword = async (password: string) => {
    const salt = await genSalt(10);

    return hash(password, salt);
};

const mutation: GraphQLMutationResolvers['createAccount'] = async (
    root,
    { username, password },
    { getTranslations }
) => {
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

    try {
        await collections.users.insertOne(document);
    } catch (error) {
        if (isDuplicateErrorOnFields(error, 'username')) {
            throw new InvalidInput({ password: t('errors:duplicateUsername') });
        }

        // throw it back
        throw error;
    }

    return document;
};

export default mutation;

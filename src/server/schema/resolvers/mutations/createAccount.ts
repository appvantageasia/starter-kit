import { genSalt, hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getDatabaseContext, User } from '../../../database';
import { isDuplicateErrorOnFields } from '../../../utils';
import { validatePasswordStrength } from '../../../utils/passwords';
import { InvalidInput } from '../../errors';
import { GraphQLMutationResolvers } from '../definitions';

export const cryptPassword = async (password: string) => {
    const salt = await genSalt(10);

    return hash(password, salt);
};

const mutation: GraphQLMutationResolvers['createAccount'] = async (
    root,
    { username, password, email },
    { getTranslations }
) => {
    const { collections } = await getDatabaseContext();
    const { t } = await getTranslations(['errors']);

    if (!validatePasswordStrength(password, username)) {
        throw new InvalidInput({ password: t('errors:weakPassword') });
    }

    const document: User = {
        _id: new ObjectId(),
        username,
        displayName: username,
        password: await cryptPassword(password),
        passwordFrom: new Date(),
        previousPasswords: [],
        otpSetup: null,
        singleSessionMode: true,
        email,
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

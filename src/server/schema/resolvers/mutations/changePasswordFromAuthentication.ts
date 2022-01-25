import { ObjectId } from 'mongodb';
import { consumeToken } from '../../../core/tokens';
import { getDatabaseContext } from '../../../database';
import { validateNewPassword, validatePasswordStrength } from '../../../utils/passwords';
import { InvalidInput } from '../../errors';
import { GraphQLMutationResolvers } from '../definitions';
import { AuthenticationStep } from '../typings';
import { resumeAuthentication } from './authenticate';
import { cryptPassword } from './createAccount';

const mutation: GraphQLMutationResolvers['changePasswordFromAuthentication'] = async (
    root,
    { token: initialToken, password },
    context
) => {
    const { getTranslations, csrf: initialCSRF } = context;
    const { t } = await getTranslations(['errors']);

    // get the token
    const { userId } = await consumeToken<{ userId: ObjectId }>(
        AuthenticationStep.PasswordChange,
        initialToken,
        initialCSRF
    );

    // get the user
    const { collections } = await getDatabaseContext();
    const user = await collections.users.findOne({ _id: userId });

    if (!user) {
        // that should not happen
        throw new Error('user not found');
    }

    // check password strength
    if (!validatePasswordStrength(password, user.username)) {
        throw new InvalidInput({ password: t('errors:weakPassword') });
    }

    // check if the password was already in the previous one
    if (!(await validateNewPassword(user, password))) {
        throw new InvalidInput({ password: t('errors:reusedPassword') });
    }

    // update the password
    const { value: updatedUser } = await collections.users.findOneAndUpdate(
        { _id: user._id },
        {
            $set: {
                password: await cryptPassword(password),
                // reset the date as of now
                passwordFrom: new Date(),
                // only keep latest 24 passwords
                previousPasswords: [user.password, ...user.previousPasswords].slice(0, 24),
            },
        },
        { returnDocument: 'after' }
    );

    if (!updatedUser) {
        // should not happen
        throw new Error('Unexpected error');
    }

    return resumeAuthentication(updatedUser, context);
};

export default mutation;

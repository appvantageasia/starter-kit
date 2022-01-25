import { authenticator } from 'otplib';
import { getDatabaseContext, OTPKind, User } from '../../../database';
import { InvalidInput, InvalidPermission } from '../../errors';
import { requiresLoggedUser } from '../../middlewares';
import { GraphQLMutationResolvers } from '../definitions';

const mutation: GraphQLMutationResolvers['enableAuthenticator'] = async (
    root,
    { secret, token },
    { getUser, getTranslations }
) => {
    const { t } = await getTranslations(['errors']);
    const user = await getUser();

    if (user.otpSetup) {
        throw new InvalidPermission();
    }

    // verify the token with the secret
    const isValid = authenticator.verify({ token, secret });

    if (!isValid) {
        throw new InvalidInput({ token: t('errors:invalidTOTP') });
    }

    // prepare the setup
    const otpSetup: User['otpSetup'] = { kind: OTPKind.TOTP, secret };

    // update the user document
    const { collections } = await getDatabaseContext();
    const result = await collections.users.findOneAndUpdate(
        { _id: user._id },
        { $set: { otpSetup } },
        { returnDocument: 'after' }
    );

    return result.value;
};

export default requiresLoggedUser(mutation);

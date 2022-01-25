import { ObjectId } from 'mongodb';
import { authenticator } from 'otplib';
import { totpRateLimiter } from '../../../core/rateLimiter';
import { consumeToken } from '../../../core/tokens';
import { getDatabaseContext, OTPKind } from '../../../database';
import { InvalidInput } from '../../errors';
import { GraphQLMutationResolvers } from '../definitions';
import { AuthenticationStep } from '../typings';
import { resumeAuthentication } from './authenticate';

const mutation: GraphQLMutationResolvers['authenticateWithTOTP'] = async (
    root,
    { token: initialToken, password },
    context
) => {
    const { getTranslations, csrf: initialCSRF } = context;
    const { t } = await getTranslations(['errors']);

    // get the token
    const { userId } = await consumeToken<{ userId: ObjectId }>(AuthenticationStep.TOTP, initialToken, initialCSRF);

    // protect against brute forcing
    const isAllowed = totpRateLimiter
        .consume(userId.toHexString(), 1)
        .then(() => true)
        .catch(() => false);

    if (!isAllowed) {
        // do not provide the information as if the code is correct or not
        throw new InvalidInput({ password: t('errors:invalidTOTP') });
    }

    // get the user
    const { collections } = await getDatabaseContext();
    const user = await collections.users.findOne({ _id: userId });

    if (!user || !user.otpSetup || user.otpSetup.kind !== OTPKind.TOTP) {
        // that should not happen
        throw new Error('user not found');
    }

    const isValid = authenticator.verify({ token: password, secret: user.otpSetup.secret });

    if (!isValid) {
        throw new InvalidInput({ password: t('errors:invalidTOTP') });
    }

    return resumeAuthentication(user, context);
};

export default mutation;

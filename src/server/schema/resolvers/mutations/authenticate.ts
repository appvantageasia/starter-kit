import { compare } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { authenticationRateLimiter } from '../../../core/rateLimiter';
import { csrfGenerator, generateToken } from '../../../core/tokens';
import { getDatabaseContext, User, OTPKind } from '../../../database';
import { mainQueue } from '../../../queues';
import { isPasswordExpiredOn } from '../../../utils/passwords';
import { Context } from '../../context';
import { InvalidInput } from '../../errors';
import { getSessionToken } from '../../session';
import { GraphQLMutationResolvers } from '../definitions';
import { AuthenticationStep } from '../typings';

export const finalizeAuthentication = async (user: User, context: Context) => {
    const sessionId = new ObjectId();
    const { token, csrf, iat, exp } = await getSessionToken({ userId: user._id, sessionId });

    // create session in database for tracking
    const { collections } = await getDatabaseContext();

    await collections.userSessions.insertOne({
        _id: sessionId,
        userId: user._id,
        createdAt: iat,
        expiresAt: exp,
        lastActivityAt: iat,
        userAgent: context.userAgent,
        ip: context.ip,
    });

    // update cookies
    context.setCSRF(csrf);

    // force apply the user on the context
    context.getUser = () => Promise.resolve(user);
    context.csrf = csrf;

    // trigger events to process post-authentication jobs
    await mainQueue.add({ type: 'onUserAuthentication', userId: user._id, sessionId });

    return { user, token, _kind: AuthenticationStep.Successful };
};

export const resumeAuthentication = async (user: User, context: Context) => {
    const isPasswordExpired = isPasswordExpiredOn(user.passwordFrom);

    if (isPasswordExpired) {
        const csrf = csrfGenerator();
        const token = generateToken<{ userId: ObjectId }>(
            AuthenticationStep.PasswordChange,
            { userId: user._id },
            10 * 60,
            csrf
        );

        // update cookies
        context.setCSRF(csrf);

        return { token, user, _kind: AuthenticationStep.PasswordChange };
    }

    return finalizeAuthentication(user, context);
};

const mutation: GraphQLMutationResolvers['authenticate'] = async (root, { username, password }, context) => {
    const { getTranslations, ip, setCSRF } = context;
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

    // user may require OTP
    if (user.otpSetup) {
        switch (user.otpSetup.kind) {
            case OTPKind.TOTP: {
                const csrf = csrfGenerator();
                const token = generateToken<{ userId: ObjectId }>(
                    AuthenticationStep.TOTP,
                    { userId: user._id },
                    10 * 60,
                    csrf
                );

                // update cookies
                setCSRF(csrf);

                return { token, _kind: AuthenticationStep.TOTP };
            }

            default:
                // not implemented
                break;
        }
    }

    return resumeAuthentication(user, context);
};

export default mutation;

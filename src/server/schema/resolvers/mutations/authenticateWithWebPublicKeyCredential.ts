import { ObjectId } from 'mongodb';
import { consumeToken } from '../../../core/tokens';
import { getDatabaseContext } from '../../../database';
import { verifyAssertionResponse } from '../../../utils/webAuthn';
import { InvalidInput } from '../../errors';
import { GraphQLMutationResolvers } from '../definitions';
import { finalizeAuthentication } from './authenticate';

const mutation: GraphQLMutationResolvers['authenticateWithWebPublicKeyCredential'] = async (
    root,
    { token, response },
    context
) => {
    const { t } = await context.getTranslations(['errors']);
    const request = await consumeToken<{ challenge: string; userId: ObjectId }>(
        'webPublicKeyCredentialAuthentication',
        token,
        context.csrf
    );

    // get the user
    const { collections } = await getDatabaseContext();
    const user = await collections.users.findOne({ _id: request.userId });

    // get keys
    const webCredential = await collections.userWebCredentials.findOne({
        type: 'fido2',
        userId: user._id,
        credentialId: response.rawId,
    });

    if (!webCredential) {
        // that shouldn't happen if the FE does its job right together with the BE
        throw new InvalidInput({ $root: t('errors:invalidCredentials') });
    }

    try {
        await verifyAssertionResponse({
            userId: user._id,
            response,
            challenge: request.challenge,
            origin: context.origin,
            webCredential,
        });
    } catch (error) {
        throw new InvalidInput({ $root: t('errors:invalidCredentials') });
    }

    return finalizeAuthentication(user, context);
};

export default mutation;

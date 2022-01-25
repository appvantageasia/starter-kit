import { ObjectId } from 'mongodb';
import { generateToken } from '../../../core/tokens';
import { getAttestation } from '../../../utils/webAuthn';
import { requiresLoggedUser } from '../../middlewares';
import { GraphQLMutationResolvers } from '../definitions';

const mutation: GraphQLMutationResolvers['requestWebPublicKeyCredentialRegistration'] = async (
    root,
    args,
    { getUser }
) => {
    const user = await getUser();

    // create a challenge
    const attestation = await getAttestation();

    // then create a token
    const token = generateToken<{ challenge: string; userId: ObjectId }>(
        'webPublicKeyCredentialRegistration',
        { challenge: attestation.challenge, userId: user._id },
        10 * 60
    );

    return { token, options: attestation };
};

export default requiresLoggedUser(mutation);

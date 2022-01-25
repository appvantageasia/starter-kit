import Dayjs from 'dayjs';
import { ObjectId } from 'mongodb';
import { consumeToken } from '../../../core/tokens';
import { getDatabaseContext } from '../../../database';
import { verifyAttestationResponse } from '../../../utils/webAuthn';
import { InvalidPermission } from '../../errors';
import { requiresLoggedUser } from '../../middlewares';
import { GraphQLMutationResolvers } from '../definitions';

const mutation: GraphQLMutationResolvers['completeWebPublicKeyCredentialRegistration'] = async (
    root,
    { token, response },
    { getUser, origin, userAgent }
) => {
    const user = await getUser();

    const request = await consumeToken<{ challenge: string; userId: ObjectId }>(
        'webPublicKeyCredentialRegistration',
        token
    );

    if (!user._id.equals(request.userId)) {
        throw new InvalidPermission();
    }

    const verified = await verifyAttestationResponse(response, request.challenge, origin);

    const { collections } = await getDatabaseContext();
    await collections.userWebCredentials.insertOne({
        _id: new ObjectId(),

        // attach to our user
        userId: user._id,
        userAgent: userAgent || 'Unknown',

        // set expiration for 90 days
        expiresAt: Dayjs().add(90, 'day').toDate(),
        lastUsed: null,

        // push the verified attestation
        ...verified,
    });

    return true;
};

export default requiresLoggedUser(mutation);

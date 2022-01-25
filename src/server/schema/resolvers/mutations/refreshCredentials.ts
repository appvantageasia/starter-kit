import { getDatabaseContext } from '../../../database';
import { requiresLoggedUser } from '../../middlewares';
import { getSessionToken } from '../../session';
import { GraphQLMutationResolvers } from '../definitions';

const mutation: GraphQLMutationResolvers['refreshCredentials'] = async (root, args, { session, setCSRF }) => {
    const { token, csrf, exp } = await getSessionToken(session);

    // update cookies
    setCSRF(csrf);

    // update session tracker
    const { collections } = await getDatabaseContext();
    await collections.userSessions.updateOne(
        { _id: session.sessionId },
        {
            $set: {
                // update expiration
                expiresAt: exp,
            },
        }
    );

    return token;
};

export default requiresLoggedUser(mutation);

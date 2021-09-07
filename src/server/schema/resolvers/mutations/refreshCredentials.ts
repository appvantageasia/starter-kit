import { requiresLoggedUser } from '../../middlewares';
import { getSessionToken } from '../../session';
import { GraphQLMutationResolvers } from '../definitions';

const mutation: GraphQLMutationResolvers['refreshCredentials'] = async (root, args, { session, setCSRF }) => {
    const { token, csrf } = await getSessionToken(session);

    // update cookies
    setCSRF(csrf);

    return token;
};

export default requiresLoggedUser(mutation);

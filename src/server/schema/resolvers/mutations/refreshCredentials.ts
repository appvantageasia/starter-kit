import { requiresLoggedUser } from '../../middlewares';
import { getSessionToken } from '../../session';
import { GraphQLMutationResolvers } from '../definitions';

const mutation: GraphQLMutationResolvers['refreshCredentials'] = async (root, args, { session }) =>
    getSessionToken(session);

export default requiresLoggedUser(mutation);

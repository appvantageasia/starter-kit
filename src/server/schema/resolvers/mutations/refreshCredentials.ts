import { RootResolver } from '../../context';
import { requiresLoggedUser } from '../../middlewares';
import { getSessionToken } from '../../session';

const mutation: RootResolver = async (root, args, { session }): Promise<string> => getSessionToken(session);

export default requiresLoggedUser(mutation);

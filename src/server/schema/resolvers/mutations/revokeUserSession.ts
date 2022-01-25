import { getDatabaseContext } from '../../../database';
import { publishUserSessionRevoked } from '../../../utils/systemMessage';
import { requiresLoggedUser } from '../../middlewares';
import { GraphQLMutationResolvers } from '../definitions';

const mutation: GraphQLMutationResolvers['revokeUserSession'] = async (
    root,
    { id, displayNotice = false },
    { getUser }
) => {
    const user = await getUser();
    const { collections } = await getDatabaseContext();

    const results = await collections.userSessions.deleteOne({ _id: id, userId: user._id });

    if (results.deletedCount > 0) {
        await publishUserSessionRevoked(user._id, id, displayNotice);

        return true;
    }

    return false;
};

export default requiresLoggedUser(mutation);

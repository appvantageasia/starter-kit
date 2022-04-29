import { getDatabaseContext } from '../../../database';
import { InvalidPermission } from '../../errors';
import { requiresLoggedUser } from '../../middlewares';
import { GraphQLMutationResolvers } from '../definitions';

const mutation: GraphQLMutationResolvers['disableAuthenticator'] = async (root, args, { getUser }) => {
    const user = await getUser();

    if (!user.otpSetup) {
        throw new InvalidPermission();
    }

    // update the user document
    const { collections } = await getDatabaseContext();
    const result = await collections.users.findOneAndUpdate(
        { _id: user._id },
        { $set: { otpSetup: null } },
        { returnDocument: 'after' }
    );

    return result.value;
};

export default requiresLoggedUser(mutation);

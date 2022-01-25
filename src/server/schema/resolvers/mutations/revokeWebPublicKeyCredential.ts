import { getDatabaseContext } from '../../../database';
import { requiresLoggedUser } from '../../middlewares';
import { GraphQLMutationResolvers } from '../definitions';

const mutation: GraphQLMutationResolvers['revokeWebPublicKeyCredential'] = async (root, { id }, { getUser }) => {
    const user = await getUser();
    const { collections } = await getDatabaseContext();

    const results = await collections.userWebCredentials.findOneAndDelete({ _id: id, userId: user._id });

    if (results.value) {
        return results.value.credentialId;
    }

    return null;
};

export default requiresLoggedUser(mutation);

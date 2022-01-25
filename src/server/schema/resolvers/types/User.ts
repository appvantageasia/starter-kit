import { getDatabaseContext } from '../../../database';
import { getPasswordExpirationDate, isPasswordExpiredOn } from '../../../utils/passwords';
import { getFriendlyUserAgent } from '../../../utils/userAgent';
import { GraphQLUserResolvers } from '../definitions';

const UserGraphQL: GraphQLUserResolvers = {
    id: root => root._id,
    email: async (root, args, { getUser }) => {
        const user = await getUser();

        if (root._id.equals(user?._id)) {
            return root.email;
        }

        // return an empty value rather than reject the request
        return '';
    },
    username: async (root, args, { getUser }) => {
        const user = await getUser();

        if (root._id.equals(user?._id)) {
            return root.username;
        }

        // return an empty value rather than reject the request
        return '';
    },
    isPasswordExpired: async (root, args, { getUser }) => {
        const user = await getUser();

        if (root._id.equals(user?._id)) {
            return isPasswordExpiredOn(root.passwordFrom);
        }

        // return an empty value rather than reject the request
        return false;
    },
    isAuthenticatorEnabled: async (root, args, { getUser }) => {
        const user = await getUser();

        if (root._id.equals(user?._id)) {
            return !!root.otpSetup;
        }

        // return an empty value rather than reject the request
        return true;
    },
    passwordExpiresAt: async (root, args, { getUser }) => {
        const user = await getUser();

        if (root._id.equals(user?._id)) {
            return getPasswordExpirationDate(root.passwordFrom).toDate();
        }

        // return the current date rather than reject the request
        return new Date();
    },
    webAuthnKeys: async (root, args, { getUser }) => {
        const user = await getUser();

        if (!root._id.equals(user?._id)) {
            // return an empty list for other users
            return [];
        }

        const { collections } = await getDatabaseContext();
        const keys = await collections.userWebCredentials.find({ type: 'fido2', userId: root._id }).toArray();

        return keys.map(key => ({
            id: key._id,
            rawKeyId: key.credentialId,
            userAgent: getFriendlyUserAgent(key.userAgent),
            expiresAt: key.expiresAt,
            lastUsed: key.lastUsed,
        }));
    },
    sessions: async (root, args, { getUser }) => {
        const user = await getUser();

        if (!root._id.equals(user?._id)) {
            // return an empty list for other users
            return [];
        }

        const { collections } = await getDatabaseContext();

        return collections.userSessions.find({ userId: root._id }).toArray();
    },
};

export default UserGraphQL;

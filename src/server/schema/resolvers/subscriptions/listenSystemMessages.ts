import getPubSub from '../../../core/pubSub';
import { GraphQLSubscriptionResolvers } from '../definitions';

export const systemMessagePubSub = getPubSub();

const resolver: GraphQLSubscriptionResolvers['listenSystemMessages'] = {
    // todo investigate typing issue with subscriptions
    // @ts-ignore
    subscribe: async (rootValue, args, { getUser, session }) => {
        const user = await getUser(true);

        const channels = [
            // all users can listen to broadcast for the whole system
            'gql.system.all',
        ];

        if (user) {
            // add some channels specific to the user
            channels.push(`gql.user.${user._id.toHexString()}`);
        }

        if (session) {
            // listen to boadcast for this session
            channels.push(`gql.session.${session.sessionId.toHexString()}`);
        }

        return systemMessagePubSub.asyncIterator(channels);
    },
};

export default resolver;

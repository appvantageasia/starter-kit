import { withFilter } from 'graphql-subscriptions';
import { ObjectId } from 'mongodb';
import { Subscription } from '../../../core/pubSub';
import { Topic } from '../../../database';
import { GraphQLSubscriptionResolvers } from '../definitions';

type Args = {
    topicId: ObjectId;
};

export type TopicUpdatedMessage = Topic;

type Payload = { topicUpdated: TopicUpdatedMessage };

export const topicUpdatedSubscription = new Subscription<TopicUpdatedMessage>('gql.topicUpdated', 'topicUpdated');

const resolver: GraphQLSubscriptionResolvers['topicUpdated'] = {
    // @ts-ignore
    subscribe: withFilter(
        () => topicUpdatedSubscription.subscribe(),
        (payload: Payload, variables: Args) =>
            // only push for the same topic
            payload.topicUpdated._id.equals(variables.topicId)
    ),
};

export default resolver;

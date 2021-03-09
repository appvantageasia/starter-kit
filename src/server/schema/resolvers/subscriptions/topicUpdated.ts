import { withFilter } from 'apollo-server';
import { ObjectId } from 'mongodb';
import { Topic } from '../../../database';
import { Subscription } from '../../../pubSub';

type Args = {
    topicId: ObjectId;
};

export type TopicUpdatedMessage = Topic;

type Payload = { topicUpdated: TopicUpdatedMessage };

export const topicUpdatedSubscription = new Subscription<TopicUpdatedMessage>('gql.topicUpdated', 'topicUpdated');

const resolver = {
    subscribe: withFilter(
        () => topicUpdatedSubscription.subscribe(),
        (payload: Payload, variables: Args) =>
            // only push for the same topic
            payload.topicUpdated._id.equals(variables.topicId)
    ),
};

export default resolver;

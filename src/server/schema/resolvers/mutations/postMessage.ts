import { ObjectId } from 'mongodb';
import { getDatabaseContext, TopicMessage } from '../../../database';
import { requiresLoggedUser } from '../../middlewares';
import { GraphQLMutationResolvers } from '../definitions';
import { topicUpdatedSubscription } from '../subscriptions/topicUpdated';

const mutation: GraphQLMutationResolvers['postMessage'] = async (root, { topicId, body }, { getUser }) => {
    const { collections } = await getDatabaseContext();
    const user = await getUser();

    const now = new Date();

    const document: TopicMessage = {
        _id: new ObjectId(),
        body,
        createdAt: now,
        authorId: user._id,
    };

    const operation = await collections.topics.findOneAndUpdate(
        { _id: topicId },
        { $push: { messages: document }, $set: { updatedAt: now } },
        { returnDocument: 'after' }
    );

    if (operation.value) {
        // emit on the subscription this topic has been updated
        topicUpdatedSubscription.publish(operation.value);
    }

    return operation?.value;
};

export default requiresLoggedUser(mutation);

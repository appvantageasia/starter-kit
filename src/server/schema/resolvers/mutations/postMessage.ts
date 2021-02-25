import { ObjectId } from 'mongodb';
import { getDatabaseContext, TopicMessage, Topic } from '../../../database';
import { RootResolver } from '../../context';
import { requiresLoggedUser } from '../../middlewares';

type Args = { topicId: ObjectId; body: string };

const mutation: RootResolver<Args> = async (root, { topicId, body }, { getUser }): Promise<Topic | null> => {
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
        { returnOriginal: false }
    );

    return operation?.value;
};

export default requiresLoggedUser(mutation);

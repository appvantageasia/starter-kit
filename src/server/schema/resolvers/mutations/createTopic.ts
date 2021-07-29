import { ObjectId } from 'mongodb';
import { handleMultipleFileUpload } from '../../../core/storage';
import { getDatabaseContext, Topic } from '../../../database';
import { requiresLoggedUser } from '../../middlewares';
import { GraphQLMutationResolvers } from '../definitions';

const mutation: GraphQLMutationResolvers['createTopic'] = async (root, { title, body, attachments }, { getUser }) => {
    const { collections } = await getDatabaseContext();
    const user = await getUser();

    const now = new Date();
    const topicId = new ObjectId();

    const bucketPath = `topics/${topicId}/attachments`;
    const bucketMetaData = { topicId: topicId.toHexString() };

    const uploadedFiles = attachments?.length
        ? await handleMultipleFileUpload(bucketPath, await Promise.all(attachments), bucketMetaData)
        : [];

    const document: Topic = {
        _id: topicId,
        title,
        body,
        messages: [],
        attachments: uploadedFiles,
        createdAt: now,
        updatedAt: now,
        authorId: user._id,
    };

    await collections.topics.insertOne(document);

    return document;
};

export default requiresLoggedUser(mutation);

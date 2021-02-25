import { FileUpload } from 'graphql-upload';
import { ObjectId } from 'mongodb';
import { getDatabaseContext, Topic } from '../../../database';
import { handleMultipleFileUpload } from '../../../storage';
import { RootResolver } from '../../context';
import { requiresLoggedUser } from '../../middlewares';

type Args = { title: string; body: string; attachments?: Promise<FileUpload>[] | null };

const mutation: RootResolver<Args> = async (root, { title, body, attachments }, { getUser }): Promise<Topic> => {
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

import DataLoader from 'dataloader';
import { uniq } from 'lodash/fp';
import { ObjectId } from 'mongodb';
import { getDatabaseContext, Topic } from '../database';
import { buildManyToManyLoader, buildManyToOneLoader, buildOneToOneLoader } from './helpers';

export type TopicLoaders = {
    topicById: DataLoader<ObjectId, Topic>;
    topicsByAuthorId: DataLoader<ObjectId, Topic[]>;
    topicsByContributorId: DataLoader<ObjectId, Topic[]>;
};

const createTopicLoaders = (): TopicLoaders => {
    const topicById = buildOneToOneLoader<Topic>(keys =>
        getDatabaseContext().then(({ collections }) => collections.topics.find({ _id: { $in: keys } }).toArray())
    );

    const topicsByAuthorId = buildManyToOneLoader<Topic>(
        keys =>
            getDatabaseContext().then(({ collections }) =>
                collections.topics.find({ authorId: { $in: keys } }).toArray()
            ),
        topic => topic.authorId.toHexString()
    );

    const topicsByContributorId = buildManyToManyLoader<Topic>(
        keys =>
            getDatabaseContext().then(({ collections }) =>
                collections.topics
                    .find({ $or: [{ authorId: { $in: keys } }, { 'messages.authorId': { $in: keys } }] })
                    .toArray()
            ),
        topic => uniq([topic.authorId.toHexString(), ...topic.messages.map(message => message.authorId.toHexString())])
    );

    return { topicById, topicsByAuthorId, topicsByContributorId };
};

export default createTopicLoaders;

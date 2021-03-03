import createTopicLoaders, { TopicLoaders } from './topics';
import createUserLoaders, { UserLoaders } from './users';

export type Loaders = TopicLoaders & UserLoaders;

const createLoaders = (): Loaders => ({
    ...createTopicLoaders(),
    ...createUserLoaders(),
});

export default createLoaders;

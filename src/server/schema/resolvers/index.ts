import * as enums from './enums';
import * as Mutation from './mutations';
import * as Query from './queries';
import * as Subscription from './subscriptions';
import * as types from './types';

const resolvers = {
    Query,
    Mutation,
    Subscription,
    ...types,
    ...enums,
};

export default resolvers;

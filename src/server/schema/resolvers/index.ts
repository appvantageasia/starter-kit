import * as enums from './enums';
import * as Mutation from './mutations';
import * as Query from './queries';
import * as types from './types';

const resolvers = {
    Query,
    Mutation,
    ...types,
    ...enums,
};

export default resolvers;

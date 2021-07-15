import { makeExecutableSchema } from '@graphql-tools/schema';
import resolvers from './resolvers';
import typeDefs from './typeDefs.graphql';

const schema = makeExecutableSchema({ typeDefs: [typeDefs], resolvers });

export default schema;

import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { SchemaLink } from '@apollo/client/link/schema';
import schema from '../schema';
import { Context } from '../schema/context';

const createApolloClient = (context: Context) => (): ApolloClient<NormalizedCacheObject> => {
    // create a schema link
    const schemaLink = new SchemaLink({ schema, rootValue: null, context });

    return new ApolloClient({
        ssrMode: true,
        link: schemaLink,
        cache: new InMemoryCache(),
    });
};

export default createApolloClient;

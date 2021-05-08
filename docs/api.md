# GraphQL API

The API for the application is a GraphQL API based on [Apollo server][apollo-server].
To implement or develop any changes it's very important you first understand what is [GraphQL][gql].

The schema is defined in the `schema` directory (from the root directory).
You may split the schema into multiple file, those will be aggregated and seen as only one schema.

For WebStorm and VSCode there are plugins you may install to make your IDE aware of the GraphQL schema.
Configuration files are already included in the project, so your only action should be to install the plugins.

When you update the schema you need then to execute the following command :

```bash
yarn generate:schema
```

It will execute [code generation][gql-gen] and automatically output the following :

-   It will aggregate your schema as one to `src/server/schema/typeDefs.graphql`
-   It will generate typeScript types for your resolvers in `src/server/api/schema/resolvers/definitions.ts`
-   It will generate TypeScript types related to your schema in `src/app/api/index.ts`
-   It will parse graphql files from `src/app/api/**/*.graphql` to extract operations :
    -   TypeScript types for fragments and operations will be generated
    -   typeScript for Apollo hooks will be generated

It means whenever you require to call your GraphQL API from your Application ;
You may simply define your operation in `src/app/api` in a GraphQL files and then execute the previous command line.
After what you should have everything you need by importing `src/app/api` from your TS/JS files.

Please read the [Apollo React] documentation to understand more about the GraphQL Client.

[gql]: https://graphql.org/
[apollo-server]: https://www.apollographql.com/docs/apollo-server/
[apollo-react]: https://www.apollographql.com/docs/react
[gql-gen]: https://graphql-code-generator.com/

The backend implementation is fully organized in the `src/server/schema` directory.

-   the `resolvers` directory groups all resolvers for the schema
    -   mutations are grouped in the `mutations` directory
    -   queries are grouped in the `queries` directory
    -   subscriptions are grouped in the `subscriptions` directory
    -   types and scalars are grouped in the `types` directory
    -   **reminder:** resolver types are automatically generated in `src/server/api/schema/resolvers/definitions.ts`
-   the GraphQL Context definitions and generation is in the `context.ts` file
-   Common errors and helper will e in the `errors.ts` file

The GraphQL context is very important to understand as it will pass through resolvers and serve you with meaningful features or information.
Among which you will find :

-   A getter to access translations functions/instance scoped to the user language
-   Data loaders scoped to the user request
-   A getter to access the user instance if there's any
-   Other information such as the session data, the current language or IP

We rely on [Data Loaders][data-loader] to batch our queries for the database and avoid duplicated queries.
It's important to understand why we use such library and how.

## Resolvers

Resolver types are automatically generated in `src/server/api/schema/resolvers/definitions.ts`.
However you may have to maintain the type mapper in `codegen.yml` (at the root directory).

All enums exported in `src/server/schema/resolvers/enums.ts` will be automatically reused.
But if you come to create a GraphQl type which mirrored a database type/document,
you then need to link those together in your `codegen.yaml`.

For example, if you create a database document `PrivateMessage` as well as a GraphQL type meant to represent those.
You need to add the following in your configuration for code generation.

```yaml
# other config....
generates:
    # other config....
    src/server/schema/resolvers/definitions.ts:
        # other config....
        config:
            # other config....
            mappers:
                # other types....
                PrivateMessage: ../../database#PrivateMessage
```

By doing so, your resolvers will translate the `PrivateMessage` GraphQL type as the `PrivateMessage` database type.

After updating the configuration, you may run `yarn generate:schema` to execute the code generation.

[data-loader]: https://github.com/graphql/dataloader

## Example - add a Query/Mutation

Let's say we want to implement a query call `latestHeadline` and would return a `Headline` document.

First you need to add your new type into the schema which should be `schema/types/Headline.graphql`

```graphql
type Headline {
    title: String!
}
```

Then add our new query in `schema/Query.graphql`

```graphql
type Query {
    """
    Get latest headline
    """
    latestHeadline: Headline
}
```

You may now execute the code generation to update schema specifications for the apollo server.

```bash
yarn generate:schema
```

Let's create a resolver for our new query, which should be `src/server/schema/resolers/queries/latestHeadline.ts`:

```typescript
import { ObjectId } from 'mongodb';
import { GraphQLQueryResolvers } from '../definitions';

const query: GraphQLQueryResolvers['latestHeadline'] = () => {
    // here I return my headline
    return { title: 'new query available' };
};

export default query;
```

You may now import this resolver under a proper name, the name must match the one in the schema which here is `latestHeadline`.

```typescript
// in src/server/schema/resolvers/queries/index.ts
// we add the following line
export { default as latestHeadline } from './latestHeadline';
```

Our query is now being resolved by the backend.
So next we are going to focus on the client side.
First add a new operation in our API calls which is the `src/app/api` directory.
Create a new file such as `headline.graphql`

```graphql
# first we create a fragment to easily re-use the types/definitions
# remember the fragment name must be uniq in your whole application
fragment HeadlineData on Headline {
    title
}

# then define our new query
query getLatestHeadline {
    headline: latestHeadline {
        ...HeadlineData
    }
}
```

Once again execute the code generation

```bash
yarn generate:schema
```

You should now be able to import a Apollo Hook as well as types from `src/app/api`.
To conclude it, we will create a component to display the headline.

```tsx
import { useGetLatestHeadlineQuery } from './api';

const Headline = () => {
    const { data, loading } = useGetLatestHeadlineQuery();

    if (loading) {
        // not yet loaded
        return null;
    }

    const headline = data?.headline;

    if (!headline) {
        return <div>No headline yet</div>;
    }

    return <div>latest headline is {headline.title}</div>;
};
```

## Example - Subscriptions

Subscriptions are provided by [Apollo Server][sub].
A homemade wrapped has been made to serialize/deserialize message with EJSON.

[sub]: https://www.apollographql.com/docs/apollo-server/data/subscriptions/

First define TypeScript types related to your subscription.

```ts
// first create your subscription arguments
type Args = {
    topicId: ObjectId;
};

// then define your messages (data)
export type TopicUpdatedMessage = Topic;

// the payload which will be sent as root resolution
// the root key should be the same as the subscription name
// here it would be "topicUpdated"
type Payload = { topicUpdated: TopicUpdatedMessage };
```

You may now define you subscription instance by using the homemade helper.

```ts
// then create the subscription instead
export const topicUpdatedSubscription = new Subscription<TopicUpdatedMessage>(
    // channel use in redis to broker the events
    'gql.topicUpdated',
    // subscription name
    'topicUpdated'
);
```

Finally define your resolver for GraphQL and export it

```ts
import { GraphQLSubscriptionResolvers } from '../definitions';

const resolver: GraphQLSubscriptionResolvers['topicUpdated'] = {
    // with filter is optional and is a helper to filter events
    // you may read the official documentation on subscription from Apollo to understand more
    subscribe: withFilter(
        // simply call the subscribe method
        () => topicUpdatedSubscription.subscribe(),
        (payload: Payload, variables: Args) =>
            // only push for the same topic
            payload.topicUpdated._id.equals(variables.topicId)
    ),
};

export default resolver;
```

To propagate an event simply do as follow by using your subscription instance.

```ts
topicUpdatedSubscription.publish(myTopicAsMessage);
```

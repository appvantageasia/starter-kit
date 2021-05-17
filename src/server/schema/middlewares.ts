import { AuthenticationError } from 'apollo-server';
import { GraphQLFieldResolver } from 'graphql';
import { Context } from './context';

export type GraphQLMiddleware = <TSource, TContext = Context, TArgs = { [argName: string]: any }>(
    resolver: GraphQLFieldResolver<TSource, TContext, TArgs>
) => GraphQLFieldResolver<TSource, TContext, TArgs>;

export const requiresLoggedUser =
    <TSource = any, TArgs = { [argName: string]: any }>(
        resolver: GraphQLFieldResolver<TSource, Context, TArgs>
    ): GraphQLFieldResolver<TSource, Context, TArgs> =>
    async (root, args, context, info) => {
        const user = await context.getUser();

        if (!user) {
            throw new AuthenticationError('Not authenticated');
        }

        return resolver(root, args, context, info);
    };

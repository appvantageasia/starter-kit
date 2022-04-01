/* eslint-disable max-len */
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ObjectId } from 'mongodb';
import { User, Topic, TopicMessage } from '../../database';
import { FileUploadPromise, Context, RootDocument } from '../context';
import { TopicSortingField, SortingOrder } from './enums';

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
export type EnumResolverSignature<T, AllowedValues = any> = { [key in keyof T]?: AllowedValues };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    DateTime: Date;
    ObjectID: ObjectId;
    Upload: FileUploadPromise;
};

export type GraphQLAuthenticationSuccessful = {
    /** Json Web Token */
    token: Scalars['String'];
    /** User authenticated */
    user: GraphQLUser;
};

export type GraphQLMutation = {
    /** Validate credentials (username/password) and return a Json Web Token */
    authenticate: GraphQLAuthenticationSuccessful;
    /** Create a new account/user */
    createAccount: GraphQLUser;
    /**
     * Create a new topic
     *
     * Authentication is required
     */
    createTopic: GraphQLTopic;
    /**
     * Post a message on a new topicd
     *
     * Authentication is required
     */
    postMessage: GraphQLTopic;
    /**
     * Take the Json Web Token (JWT) from headers and returns a new one with a renewed lifetime
     *
     * Authentication is required
     */
    refreshCredentials: Scalars['String'];
    /**
     * Update the display name for the logged in user
     *
     * Authentication is required
     */
    updateDisplayName: GraphQLUser;
};

export type GraphQLMutationAuthenticateArgs = {
    password: Scalars['String'];
    username: Scalars['String'];
};

export type GraphQLMutationCreateAccountArgs = {
    password: Scalars['String'];
    username: Scalars['String'];
};

export type GraphQLMutationCreateTopicArgs = {
    attachments?: InputMaybe<Array<Scalars['Upload']>>;
    body: Scalars['String'];
    title: Scalars['String'];
};

export type GraphQLMutationPostMessageArgs = {
    body: Scalars['String'];
    topicId: Scalars['ObjectID'];
};

export type GraphQLMutationUpdateDisplayNameArgs = {
    displayName: Scalars['String'];
};

export type GraphQLPagination = {
    /** Number of items to fetch from a list */
    limit: Scalars['Int'];
    /** Offset to apply when fetching a list */
    offset: Scalars['Int'];
};

export type GraphQLQuery = {
    /** Fetch user document for the logged in user, returns null otherwise for anonymous */
    account?: Maybe<GraphQLUser>;
    /** Fetch a topic by its ID */
    topic?: Maybe<GraphQLTopic>;
    /**
     * List topics
     *
     * If not sorting is provided, topics are sorted by descending update date
     */
    topics: Array<GraphQLTopic>;
};

export type GraphQLQueryTopicArgs = {
    id: Scalars['ObjectID'];
};

export type GraphQLQueryTopicsArgs = {
    pagination?: InputMaybe<GraphQLPagination>;
    sorting?: InputMaybe<GraphQLTopicSorting>;
};

export { SortingOrder };

export type GraphQLSubscription = {
    topicUpdated: GraphQLTopic;
};

export type GraphQLSubscriptionTopicUpdatedArgs = {
    topicId: Scalars['ObjectID'];
};

export type GraphQLTopic = {
    author: GraphQLUser;
    body: Scalars['String'];
    createdAt: Scalars['DateTime'];
    id?: Maybe<Scalars['ObjectID']>;
    /** list of messages posted on the topic */
    messages: Array<GraphQLTopicMessage>;
    /** Counting how many messages are posted on this topic */
    messagesCount: Scalars['Int'];
    title: Scalars['String'];
    updatedAt: Scalars['DateTime'];
};

export type GraphQLTopicMessage = {
    author: GraphQLUser;
    body: Scalars['String'];
    createdAt: Scalars['DateTime'];
    id?: Maybe<Scalars['ObjectID']>;
};

export type GraphQLTopicSorting = {
    field: TopicSortingField;
    order: SortingOrder;
};

export { TopicSortingField };

export type GraphQLUser = {
    /** Public displayed on interfaces */
    displayName: Scalars['String'];
    id: Scalars['ObjectID'];
    /** List of topic authored by the user */
    topics: GraphQLTopic;
    username: Scalars['String'];
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
    | ResolverFn<TResult, TParent, TContext, TArgs>
    | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
    resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
    resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
    | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
    | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
    | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
    | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
    parent: TParent,
    context: TContext,
    info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
    obj: T,
    context: TContext,
    info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
    next: NextResolverFn<TResult>,
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type GraphQLResolversTypes = {
    AuthenticationSuccessful: ResolverTypeWrapper<
        Omit<GraphQLAuthenticationSuccessful, 'user'> & { user: GraphQLResolversTypes['User'] }
    >;
    Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
    DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
    Int: ResolverTypeWrapper<Scalars['Int']>;
    Mutation: ResolverTypeWrapper<RootDocument>;
    ObjectID: ResolverTypeWrapper<Scalars['ObjectID']>;
    Pagination: GraphQLPagination;
    Query: ResolverTypeWrapper<RootDocument>;
    SortingOrder: SortingOrder;
    String: ResolverTypeWrapper<Scalars['String']>;
    Subscription: ResolverTypeWrapper<RootDocument>;
    Topic: ResolverTypeWrapper<Topic>;
    TopicMessage: ResolverTypeWrapper<TopicMessage>;
    TopicSorting: GraphQLTopicSorting;
    TopicSortingField: TopicSortingField;
    Upload: ResolverTypeWrapper<Scalars['Upload']>;
    User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type GraphQLResolversParentTypes = {
    AuthenticationSuccessful: Omit<GraphQLAuthenticationSuccessful, 'user'> & {
        user: GraphQLResolversParentTypes['User'];
    };
    Boolean: Scalars['Boolean'];
    DateTime: Scalars['DateTime'];
    Int: Scalars['Int'];
    Mutation: RootDocument;
    ObjectID: Scalars['ObjectID'];
    Pagination: GraphQLPagination;
    Query: RootDocument;
    String: Scalars['String'];
    Subscription: RootDocument;
    Topic: Topic;
    TopicMessage: TopicMessage;
    TopicSorting: GraphQLTopicSorting;
    Upload: Scalars['Upload'];
    User: User;
};

export type GraphQLAuthenticationSuccessfulResolvers<
    ContextType = Context,
    ParentType extends GraphQLResolversParentTypes['AuthenticationSuccessful'] = GraphQLResolversParentTypes['AuthenticationSuccessful']
> = {
    token?: Resolver<GraphQLResolversTypes['String'], ParentType, ContextType>;
    user?: Resolver<GraphQLResolversTypes['User'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface GraphQLDateTimeScalarConfig extends GraphQLScalarTypeConfig<GraphQLResolversTypes['DateTime'], any> {
    name: 'DateTime';
}

export type GraphQLMutationResolvers<
    ContextType = Context,
    ParentType extends GraphQLResolversParentTypes['Mutation'] = GraphQLResolversParentTypes['Mutation']
> = {
    authenticate?: Resolver<
        GraphQLResolversTypes['AuthenticationSuccessful'],
        ParentType,
        ContextType,
        RequireFields<GraphQLMutationAuthenticateArgs, 'password' | 'username'>
    >;
    createAccount?: Resolver<
        GraphQLResolversTypes['User'],
        ParentType,
        ContextType,
        RequireFields<GraphQLMutationCreateAccountArgs, 'password' | 'username'>
    >;
    createTopic?: Resolver<
        GraphQLResolversTypes['Topic'],
        ParentType,
        ContextType,
        RequireFields<GraphQLMutationCreateTopicArgs, 'body' | 'title'>
    >;
    postMessage?: Resolver<
        GraphQLResolversTypes['Topic'],
        ParentType,
        ContextType,
        RequireFields<GraphQLMutationPostMessageArgs, 'body' | 'topicId'>
    >;
    refreshCredentials?: Resolver<GraphQLResolversTypes['String'], ParentType, ContextType>;
    updateDisplayName?: Resolver<
        GraphQLResolversTypes['User'],
        ParentType,
        ContextType,
        RequireFields<GraphQLMutationUpdateDisplayNameArgs, 'displayName'>
    >;
};

export interface GraphQLObjectIdScalarConfig extends GraphQLScalarTypeConfig<GraphQLResolversTypes['ObjectID'], any> {
    name: 'ObjectID';
}

export type GraphQLQueryResolvers<
    ContextType = Context,
    ParentType extends GraphQLResolversParentTypes['Query'] = GraphQLResolversParentTypes['Query']
> = {
    account?: Resolver<Maybe<GraphQLResolversTypes['User']>, ParentType, ContextType>;
    topic?: Resolver<
        Maybe<GraphQLResolversTypes['Topic']>,
        ParentType,
        ContextType,
        RequireFields<GraphQLQueryTopicArgs, 'id'>
    >;
    topics?: Resolver<Array<GraphQLResolversTypes['Topic']>, ParentType, ContextType, Partial<GraphQLQueryTopicsArgs>>;
};

export type GraphQLSortingOrderResolvers = EnumResolverSignature<
    { Asc?: any; Desc?: any },
    GraphQLResolversTypes['SortingOrder']
>;

export type GraphQLSubscriptionResolvers<
    ContextType = Context,
    ParentType extends GraphQLResolversParentTypes['Subscription'] = GraphQLResolversParentTypes['Subscription']
> = {
    topicUpdated?: SubscriptionResolver<
        GraphQLResolversTypes['Topic'],
        'topicUpdated',
        ParentType,
        ContextType,
        RequireFields<GraphQLSubscriptionTopicUpdatedArgs, 'topicId'>
    >;
};

export type GraphQLTopicResolvers<
    ContextType = Context,
    ParentType extends GraphQLResolversParentTypes['Topic'] = GraphQLResolversParentTypes['Topic']
> = {
    author?: Resolver<GraphQLResolversTypes['User'], ParentType, ContextType>;
    body?: Resolver<GraphQLResolversTypes['String'], ParentType, ContextType>;
    createdAt?: Resolver<GraphQLResolversTypes['DateTime'], ParentType, ContextType>;
    id?: Resolver<Maybe<GraphQLResolversTypes['ObjectID']>, ParentType, ContextType>;
    messages?: Resolver<Array<GraphQLResolversTypes['TopicMessage']>, ParentType, ContextType>;
    messagesCount?: Resolver<GraphQLResolversTypes['Int'], ParentType, ContextType>;
    title?: Resolver<GraphQLResolversTypes['String'], ParentType, ContextType>;
    updatedAt?: Resolver<GraphQLResolversTypes['DateTime'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GraphQLTopicMessageResolvers<
    ContextType = Context,
    ParentType extends GraphQLResolversParentTypes['TopicMessage'] = GraphQLResolversParentTypes['TopicMessage']
> = {
    author?: Resolver<GraphQLResolversTypes['User'], ParentType, ContextType>;
    body?: Resolver<GraphQLResolversTypes['String'], ParentType, ContextType>;
    createdAt?: Resolver<GraphQLResolversTypes['DateTime'], ParentType, ContextType>;
    id?: Resolver<Maybe<GraphQLResolversTypes['ObjectID']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GraphQLTopicSortingFieldResolvers = EnumResolverSignature<
    { CreateDate?: any; UpdateDate?: any },
    GraphQLResolversTypes['TopicSortingField']
>;

export interface GraphQLUploadScalarConfig extends GraphQLScalarTypeConfig<GraphQLResolversTypes['Upload'], any> {
    name: 'Upload';
}

export type GraphQLUserResolvers<
    ContextType = Context,
    ParentType extends GraphQLResolversParentTypes['User'] = GraphQLResolversParentTypes['User']
> = {
    displayName?: Resolver<GraphQLResolversTypes['String'], ParentType, ContextType>;
    id?: Resolver<GraphQLResolversTypes['ObjectID'], ParentType, ContextType>;
    topics?: Resolver<GraphQLResolversTypes['Topic'], ParentType, ContextType>;
    username?: Resolver<GraphQLResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GraphQLResolvers<ContextType = Context> = {
    AuthenticationSuccessful?: GraphQLAuthenticationSuccessfulResolvers<ContextType>;
    DateTime?: GraphQLScalarType;
    Mutation?: GraphQLMutationResolvers<ContextType>;
    ObjectID?: GraphQLScalarType;
    Query?: GraphQLQueryResolvers<ContextType>;
    SortingOrder?: GraphQLSortingOrderResolvers;
    Subscription?: GraphQLSubscriptionResolvers<ContextType>;
    Topic?: GraphQLTopicResolvers<ContextType>;
    TopicMessage?: GraphQLTopicMessageResolvers<ContextType>;
    TopicSortingField?: GraphQLTopicSortingFieldResolvers;
    Upload?: GraphQLScalarType;
    User?: GraphQLUserResolvers<ContextType>;
};

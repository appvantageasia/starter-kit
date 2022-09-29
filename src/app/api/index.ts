/* eslint-disable */
import { DocumentNode } from 'graphql';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: string | Date;
  JSONObject: any;
  ObjectID: string;
  Upload: File;
};

export type AuthenticationRequiresNewPassword = {
  __typename?: 'AuthenticationRequiresNewPassword';
  /** Token to use with the mutation `changePasswordFromAuthentication` */
  token: Scalars['String'];
  /** User authenticated */
  user: User;
};

export type AuthenticationRequiresTotp = {
  __typename?: 'AuthenticationRequiresTOTP';
  /** Token to use with the mutation `authenticateWithTOTP` */
  token: Scalars['String'];
};

export type AuthenticationResponse = AuthenticationRequiresNewPassword | AuthenticationRequiresTotp | AuthenticationSuccessful;

export type AuthenticationSuccessful = {
  __typename?: 'AuthenticationSuccessful';
  /** Bearer token to use in the Authorization header */
  token: Scalars['String'];
  /** User authenticated */
  user: User;
};

export type AuthenticationWithWebPublicKeyCredential = {
  __typename?: 'AuthenticationWithWebPublicKeyCredential';
  /** Allowed credentials */
  allowCredentials: Array<Scalars['JSONObject']>;
  /** Challenge for the request */
  challenge: Scalars['String'];
  /** Timeout */
  timeout?: Maybe<Scalars['Int']>;
  /** Token to use with the mutation `authenticateWithWebPublicKeyCredential` */
  token: Scalars['String'];
};

export type AuthenticatorSetup = {
  __typename?: 'AuthenticatorSetup';
  /** QRCode URI for the given authenticator secret */
  qrcodeUri: Scalars['String'];
  /** Authenticator secret */
  secret: Scalars['String'];
};

export type ExternalLink = ResetPasswordLink;

export type MessageNotice = {
  __typename?: 'MessageNotice';
  date: Scalars['DateTime'];
  message: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Request to renew a password */
  applyForPasswordChange: Scalars['Boolean'];
  /** Validate credentials (username/password) and return a Json Web Token */
  authenticate: AuthenticationResponse;
  /** Continue authentication with TOTP */
  authenticateWithTOTP: AuthenticationResponse;
  /** Authenticate with a web public key credential */
  authenticateWithWebPublicKeyCredential: AuthenticationResponse;
  /** Change password following a successful authentication */
  changePasswordFromAuthentication: AuthenticationResponse;
  /** Change password by using a token */
  changePasswordFromToken: Scalars['Boolean'];
  /** Complete registration request for a web public key */
  completeWebPublicKeyCredentialRegistration: Scalars['Boolean'];
  /** Create a new account/user */
  createAccount: User;
  /** Disable 2FA / Authenticator for the signed user */
  disableAuthenticator: User;
  /** Enable 2FA / Authenticator for the signed user */
  enableAuthenticator: User;
  /** Generate a challenge to authenticate with web credentials */
  generateWebCredentialAuthentication?: Maybe<AuthenticationWithWebPublicKeyCredential>;
  /**
   * Take the Json Web Token (JWT) from headers and returns a new one with a renewed lifetime
   *
   * Authentication is required
   */
  refreshCredentials: Scalars['String'];
  /** Create a web public key credential registration request */
  requestWebPublicKeyCredentialRegistration: WebPublicKeyCredentialRegistrationRequest;
  /** Revoke user session */
  revokeUserSession: Scalars['Boolean'];
  /**
   * Revoke web public ket credential
   *
   * Return the key ID revoked
   */
  revokeWebPublicKeyCredential?: Maybe<Scalars['String']>;
  /**
   * Update the display name for the logged in user
   *
   * Authentication is required
   */
  updateDisplayName: User;
};


export type MutationApplyForPasswordChangeArgs = {
  username: Scalars['String'];
};


export type MutationAuthenticateArgs = {
  password: Scalars['String'];
  username: Scalars['String'];
};


export type MutationAuthenticateWithTotpArgs = {
  password: Scalars['String'];
  token: Scalars['String'];
};


export type MutationAuthenticateWithWebPublicKeyCredentialArgs = {
  response: Scalars['JSONObject'];
  token: Scalars['String'];
};


export type MutationChangePasswordFromAuthenticationArgs = {
  password: Scalars['String'];
  token: Scalars['String'];
};


export type MutationChangePasswordFromTokenArgs = {
  password?: InputMaybe<Scalars['String']>;
  token: Scalars['String'];
};


export type MutationCompleteWebPublicKeyCredentialRegistrationArgs = {
  response: Scalars['JSONObject'];
  token: Scalars['String'];
};


export type MutationCreateAccountArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
  username: Scalars['String'];
};


export type MutationEnableAuthenticatorArgs = {
  secret: Scalars['String'];
  token: Scalars['String'];
};


export type MutationGenerateWebCredentialAuthenticationArgs = {
  username: Scalars['String'];
};


export type MutationRevokeUserSessionArgs = {
  displayNotice?: InputMaybe<Scalars['Boolean']>;
  id: Scalars['ObjectID'];
};


export type MutationRevokeWebPublicKeyCredentialArgs = {
  id: Scalars['ObjectID'];
};


export type MutationUpdateDisplayNameArgs = {
  displayName: Scalars['String'];
};

export type PaginatedUsers = {
  __typename?: 'PaginatedUsers';
  /** Number of user matching the original query */
  count: Scalars['Int'];
  /** User on the request page */
  items: Array<User>;
};

export type Pagination = {
  /** Number of items to fetch from a list */
  limit: Scalars['Int'];
  /** Offset to apply when fetching a list */
  offset: Scalars['Int'];
};

export type Query = {
  __typename?: 'Query';
  /** Fetch user document for the logged in user, returns null otherwise for anonymous */
  currentUser?: Maybe<User>;
  /** Generate challenge to authenticate with WebAuthn */
  generateAuthenticatorChallenge?: Maybe<AuthenticationWithWebPublicKeyCredential>;
  /** Generate authenticator secret and qrcode */
  generateAuthenticatorSetup: AuthenticatorSetup;
  /** Fetch WebAuthn security keys for a username */
  getWebauthnKeys: Array<Scalars['String']>;
  /** List users */
  listUsers: PaginatedUsers;
  /** Retrieve a link information */
  retrieveLink?: Maybe<ExternalLink>;
};


export type QueryGenerateAuthenticatorChallengeArgs = {
  username: Scalars['String'];
};


export type QueryGetWebauthnKeysArgs = {
  username: Scalars['String'];
};


export type QueryListUsersArgs = {
  filter?: InputMaybe<UserFilteringRule>;
  pagination: Pagination;
  sort?: InputMaybe<UserSortingRule>;
};


export type QueryRetrieveLinkArgs = {
  id: Scalars['String'];
};

export type ResetPasswordLink = {
  __typename?: 'ResetPasswordLink';
  /** Token to use with mutation `changePasswordFromToken` */
  token: Scalars['String'];
};

export enum SortingOrder {
  /** Ascending order */
  Asc = 'Asc',
  /** Descending order */
  Desc = 'Desc'
}

export type Subscription = {
  __typename?: 'Subscription';
  listenSystemMessages: SystemMessage;
};

export type SystemMessage = MessageNotice | UserSessionRevoked;

export type User = {
  __typename?: 'User';
  /** Public displayed on interfaces */
  displayName: Scalars['String'];
  /** Email address for the user */
  email: Scalars['String'];
  /** User object ID */
  id: Scalars['ObjectID'];
  /** Is the authenticator enabled for this account */
  isAuthenticatorEnabled: Scalars['Boolean'];
  /** Is the password expired for this account */
  isPasswordExpired: Scalars['Boolean'];
  /** Password expiration date */
  passwordExpiresAt: Scalars['DateTime'];
  /** Sessions */
  sessions: Array<UserSession>;
  /** Username use for authentication */
  username: Scalars['String'];
  /** WebAuthn keys */
  webAuthnKeys: Array<UserWebAuthnKey>;
};

export type UserFilteringRule = {
  /** Filter by email */
  email?: InputMaybe<Scalars['String']>;
};

export type UserSession = {
  __typename?: 'UserSession';
  /** Creation date */
  createdAt: Scalars['DateTime'];
  /** Expiration date */
  expiresAt: Scalars['DateTime'];
  /** Session ID */
  id: Scalars['ObjectID'];
  /** IP */
  ip: Scalars['String'];
  /** Last activity date */
  lastActivityAt: Scalars['DateTime'];
  /** User agent */
  userAgent: Scalars['String'];
};

export type UserSessionRevoked = {
  __typename?: 'UserSessionRevoked';
  date: Scalars['DateTime'];
  displayNotice: Scalars['Boolean'];
};

export enum UserSortingField {
  /** Sort by authenticator enabled state */
  Authenticator = 'Authenticator',
  /** Sort by email */
  Email = 'Email'
}

export type UserSortingRule = {
  /** Field on which apply the sorting */
  field: UserSortingField;
  /** Sorting order */
  order: SortingOrder;
};

export type UserWebAuthnKey = {
  __typename?: 'UserWebAuthnKey';
  /** Expiration date */
  expiresAt: Scalars['DateTime'];
  /** Key object ID */
  id: Scalars['ObjectID'];
  /** Last usage date */
  lastUsed?: Maybe<Scalars['DateTime']>;
  /** Raw key ID */
  rawKeyId: Scalars['String'];
  /** User Agent */
  userAgent: Scalars['String'];
};

export type WebPublicKeyCredentialRegistrationRequest = {
  __typename?: 'WebPublicKeyCredentialRegistrationRequest';
  /** Options for WebAuthn */
  options: Scalars['JSONObject'];
  /** Token to proceed with registration */
  token: Scalars['String'];
};

export type RetrieveLinkQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type RetrieveLinkQuery = { __typename?: 'Query', retrieveLink?: { __typename: 'ResetPasswordLink', token: string } | null };

type SystemMessageData_MessageNotice_Fragment = { __typename: 'MessageNotice', date: string | Date, message: string };

type SystemMessageData_UserSessionRevoked_Fragment = { __typename: 'UserSessionRevoked', date: string | Date, displayNotice: boolean };

export type SystemMessageDataFragment = SystemMessageData_MessageNotice_Fragment | SystemMessageData_UserSessionRevoked_Fragment;

export type ListenOnSystemSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ListenOnSystemSubscription = { __typename?: 'Subscription', message: { __typename: 'MessageNotice', date: string | Date, message: string } | { __typename: 'UserSessionRevoked', date: string | Date, displayNotice: boolean } };

export type UserPreviewDataFragment = { __typename?: 'User', id: string, displayName: string };

export type UserListDataFragment = { __typename?: 'User', id: string, displayName: string, email: string, isAuthenticatorEnabled: boolean, isPasswordExpired: boolean };

export type UserFullDataFragment = { __typename?: 'User', id: string, username: string, displayName: string, isAuthenticatorEnabled: boolean, isPasswordExpired: boolean };

export type CurrentUserDataFragment = { __typename?: 'User', id: string, username: string, displayName: string, isAuthenticatorEnabled: boolean, isPasswordExpired: boolean, email: string, passwordExpiresAt: string | Date };

export type GetAuthenticatedUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAuthenticatedUserQuery = { __typename?: 'Query', currentUser?: { __typename?: 'User', id: string, username: string, displayName: string, isAuthenticatorEnabled: boolean, isPasswordExpired: boolean, email: string, passwordExpiresAt: string | Date } | null };

export type GetAuthenticatedUserSessionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAuthenticatedUserSessionsQuery = { __typename?: 'Query', currentUser?: { __typename?: 'User', id: string, sessions: Array<{ __typename?: 'UserSession', id: string, userAgent: string, ip: string, lastActivityAt: string | Date }> } | null };

export type GetAuthenticatedUserWebAuthnKeysQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAuthenticatedUserWebAuthnKeysQuery = { __typename?: 'Query', currentUser?: { __typename?: 'User', id: string, webAuthnKeys: Array<{ __typename?: 'UserWebAuthnKey', id: string, expiresAt: string | Date, userAgent: string, lastUsed?: string | Date | null, rawKeyId: string }> } | null };

export type RevokeSessionMutationVariables = Exact<{
  sessionId: Scalars['ObjectID'];
  displayNotice?: InputMaybe<Scalars['Boolean']>;
}>;


export type RevokeSessionMutation = { __typename?: 'Mutation', revokeUserSession: boolean };

export type AuthenticateMutationVariables = Exact<{
  username: Scalars['String'];
  password: Scalars['String'];
}>;


export type AuthenticateMutation = { __typename?: 'Mutation', authenticate: { __typename: 'AuthenticationRequiresNewPassword', token: string } | { __typename: 'AuthenticationRequiresTOTP', token: string } | { __typename: 'AuthenticationSuccessful', token: string, user: { __typename?: 'User', id: string, username: string, displayName: string, isAuthenticatorEnabled: boolean, isPasswordExpired: boolean, email: string, passwordExpiresAt: string | Date } } };

export type AuthenticateWithWebAuthnMutationVariables = Exact<{
  token: Scalars['String'];
  response: Scalars['JSONObject'];
}>;


export type AuthenticateWithWebAuthnMutation = { __typename?: 'Mutation', authenticate: { __typename: 'AuthenticationRequiresNewPassword' } | { __typename: 'AuthenticationRequiresTOTP' } | { __typename: 'AuthenticationSuccessful', token: string, user: { __typename?: 'User', id: string, username: string, displayName: string, isAuthenticatorEnabled: boolean, isPasswordExpired: boolean, email: string, passwordExpiresAt: string | Date } } };

export type ChangePasswordFromAuthenticationMutationVariables = Exact<{
  token: Scalars['String'];
  password: Scalars['String'];
}>;


export type ChangePasswordFromAuthenticationMutation = { __typename?: 'Mutation', changePasswordFromAuthentication: { __typename: 'AuthenticationRequiresNewPassword' } | { __typename: 'AuthenticationRequiresTOTP' } | { __typename: 'AuthenticationSuccessful', token: string, user: { __typename?: 'User', id: string, username: string, displayName: string, isAuthenticatorEnabled: boolean, isPasswordExpired: boolean, email: string, passwordExpiresAt: string | Date } } };

export type AuthenticateWithTotpMutationVariables = Exact<{
  token: Scalars['String'];
  password: Scalars['String'];
}>;


export type AuthenticateWithTotpMutation = { __typename?: 'Mutation', authenticateWithTOTP: { __typename: 'AuthenticationRequiresNewPassword', token: string } | { __typename: 'AuthenticationRequiresTOTP' } | { __typename: 'AuthenticationSuccessful', token: string, user: { __typename?: 'User', id: string, username: string, displayName: string, isAuthenticatorEnabled: boolean, isPasswordExpired: boolean, email: string, passwordExpiresAt: string | Date } } };

export type RefreshCredentialsMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshCredentialsMutation = { __typename?: 'Mutation', refreshCredentials: string };

export type ApplyForPasswordChangeMutationVariables = Exact<{
  username: Scalars['String'];
}>;


export type ApplyForPasswordChangeMutation = { __typename?: 'Mutation', applyForPasswordChange: boolean };

export type ChangePasswordFromTokenMutationVariables = Exact<{
  token: Scalars['String'];
  password: Scalars['String'];
}>;


export type ChangePasswordFromTokenMutation = { __typename?: 'Mutation', changePasswordFromToken: boolean };

export type ListUsersQueryVariables = Exact<{
  pagination: Pagination;
  sort?: InputMaybe<UserSortingRule>;
}>;


export type ListUsersQuery = { __typename?: 'Query', list: { __typename?: 'PaginatedUsers', count: number, items: Array<{ __typename?: 'User', id: string, displayName: string, email: string, isAuthenticatorEnabled: boolean, isPasswordExpired: boolean }> } };

export type GenerateAuthenticatorSetupQueryVariables = Exact<{ [key: string]: never; }>;


export type GenerateAuthenticatorSetupQuery = { __typename?: 'Query', response: { __typename?: 'AuthenticatorSetup', secret: string, qrcodeUri: string } };

export type EnableAuthenticatorMutationVariables = Exact<{
  secret: Scalars['String'];
  token: Scalars['String'];
}>;


export type EnableAuthenticatorMutation = { __typename?: 'Mutation', enableAuthenticator: { __typename?: 'User', id: string, username: string, displayName: string, isAuthenticatorEnabled: boolean, isPasswordExpired: boolean, email: string, passwordExpiresAt: string | Date } };

export type DisableAuthenticatorMutationVariables = Exact<{ [key: string]: never; }>;


export type DisableAuthenticatorMutation = { __typename?: 'Mutation', disableAuthenticator: { __typename?: 'User', id: string, username: string, displayName: string, isAuthenticatorEnabled: boolean, isPasswordExpired: boolean, email: string, passwordExpiresAt: string | Date } };

export type GenerateAuthenticatorChallengeQueryVariables = Exact<{
  username: Scalars['String'];
}>;


export type GenerateAuthenticatorChallengeQuery = { __typename?: 'Query', generateAuthenticatorChallenge?: { __typename?: 'AuthenticationWithWebPublicKeyCredential', token: string, challenge: string, allowCredentials: Array<any>, timeout?: number | null } | null };

export type RevokeWebPublicKeyCredentialMutationVariables = Exact<{
  keyId: Scalars['ObjectID'];
}>;


export type RevokeWebPublicKeyCredentialMutation = { __typename?: 'Mutation', revokeWebPublicKeyCredential?: string | null };

export type RequestWebPublicKeyCredentialRegistrationMutationVariables = Exact<{ [key: string]: never; }>;


export type RequestWebPublicKeyCredentialRegistrationMutation = { __typename?: 'Mutation', requestWebPublicKeyCredentialRegistration: { __typename?: 'WebPublicKeyCredentialRegistrationRequest', token: string, options: any } };

export type CompleteWebPublicKeyCredentialRegistrationMutationVariables = Exact<{
  token: Scalars['String'];
  response: Scalars['JSONObject'];
}>;


export type CompleteWebPublicKeyCredentialRegistrationMutation = { __typename?: 'Mutation', completeWebPublicKeyCredentialRegistration: boolean };

export const SystemMessageDataFragmentDoc = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SystemMessageData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SystemMessage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSessionRevoked"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"displayNotice"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MessageNotice"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode;
export const UserPreviewDataFragmentDoc = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserPreviewData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}}]} as unknown as DocumentNode;
export const UserListDataFragmentDoc = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserListData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isAuthenticatorEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isPasswordExpired"}}]}}]} as unknown as DocumentNode;
export const UserFullDataFragmentDoc = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFullData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"isAuthenticatorEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isPasswordExpired"}}]}}]} as unknown as DocumentNode;
export const CurrentUserDataFragmentDoc = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CurrentUserData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"isAuthenticatorEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isPasswordExpired"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"passwordExpiresAt"}}]}}]} as unknown as DocumentNode;
export const RetrieveLinkDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"retrieveLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"retrieveLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ResetPasswordLink"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}}]}}]}}]}}]} as unknown as DocumentNode;

/**
 * __useRetrieveLinkQuery__
 *
 * To run a query within a React component, call `useRetrieveLinkQuery` and pass it any options that fit your needs.
 * When your component renders, `useRetrieveLinkQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRetrieveLinkQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRetrieveLinkQuery(baseOptions: Apollo.QueryHookOptions<RetrieveLinkQuery, RetrieveLinkQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RetrieveLinkQuery, RetrieveLinkQueryVariables>(RetrieveLinkDocument, options);
      }
export function useRetrieveLinkLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RetrieveLinkQuery, RetrieveLinkQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RetrieveLinkQuery, RetrieveLinkQueryVariables>(RetrieveLinkDocument, options);
        }
export type RetrieveLinkQueryHookResult = ReturnType<typeof useRetrieveLinkQuery>;
export type RetrieveLinkLazyQueryHookResult = ReturnType<typeof useRetrieveLinkLazyQuery>;
export type RetrieveLinkQueryResult = Apollo.QueryResult<RetrieveLinkQuery, RetrieveLinkQueryVariables>;
export const ListenOnSystemDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"listenOnSystem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"message"},"name":{"kind":"Name","value":"listenSystemMessages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SystemMessageData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SystemMessageData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SystemMessage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSessionRevoked"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"displayNotice"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MessageNotice"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode;

/**
 * __useListenOnSystemSubscription__
 *
 * To run a query within a React component, call `useListenOnSystemSubscription` and pass it any options that fit your needs.
 * When your component renders, `useListenOnSystemSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListenOnSystemSubscription({
 *   variables: {
 *   },
 * });
 */
export function useListenOnSystemSubscription(baseOptions?: Apollo.SubscriptionHookOptions<ListenOnSystemSubscription, ListenOnSystemSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ListenOnSystemSubscription, ListenOnSystemSubscriptionVariables>(ListenOnSystemDocument, options);
      }
export type ListenOnSystemSubscriptionHookResult = ReturnType<typeof useListenOnSystemSubscription>;
export type ListenOnSystemSubscriptionResult = Apollo.SubscriptionResult<ListenOnSystemSubscription>;
export const GetAuthenticatedUserDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getAuthenticatedUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CurrentUserData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CurrentUserData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"isAuthenticatorEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isPasswordExpired"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"passwordExpiresAt"}}]}}]} as unknown as DocumentNode;

/**
 * __useGetAuthenticatedUserQuery__
 *
 * To run a query within a React component, call `useGetAuthenticatedUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAuthenticatedUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAuthenticatedUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAuthenticatedUserQuery(baseOptions?: Apollo.QueryHookOptions<GetAuthenticatedUserQuery, GetAuthenticatedUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAuthenticatedUserQuery, GetAuthenticatedUserQueryVariables>(GetAuthenticatedUserDocument, options);
      }
export function useGetAuthenticatedUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAuthenticatedUserQuery, GetAuthenticatedUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAuthenticatedUserQuery, GetAuthenticatedUserQueryVariables>(GetAuthenticatedUserDocument, options);
        }
export type GetAuthenticatedUserQueryHookResult = ReturnType<typeof useGetAuthenticatedUserQuery>;
export type GetAuthenticatedUserLazyQueryHookResult = ReturnType<typeof useGetAuthenticatedUserLazyQuery>;
export type GetAuthenticatedUserQueryResult = Apollo.QueryResult<GetAuthenticatedUserQuery, GetAuthenticatedUserQueryVariables>;
export const GetAuthenticatedUserSessionsDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getAuthenticatedUserSessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userAgent"}},{"kind":"Field","name":{"kind":"Name","value":"ip"}},{"kind":"Field","name":{"kind":"Name","value":"lastActivityAt"}}]}}]}}]}}]} as unknown as DocumentNode;

/**
 * __useGetAuthenticatedUserSessionsQuery__
 *
 * To run a query within a React component, call `useGetAuthenticatedUserSessionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAuthenticatedUserSessionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAuthenticatedUserSessionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAuthenticatedUserSessionsQuery(baseOptions?: Apollo.QueryHookOptions<GetAuthenticatedUserSessionsQuery, GetAuthenticatedUserSessionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAuthenticatedUserSessionsQuery, GetAuthenticatedUserSessionsQueryVariables>(GetAuthenticatedUserSessionsDocument, options);
      }
export function useGetAuthenticatedUserSessionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAuthenticatedUserSessionsQuery, GetAuthenticatedUserSessionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAuthenticatedUserSessionsQuery, GetAuthenticatedUserSessionsQueryVariables>(GetAuthenticatedUserSessionsDocument, options);
        }
export type GetAuthenticatedUserSessionsQueryHookResult = ReturnType<typeof useGetAuthenticatedUserSessionsQuery>;
export type GetAuthenticatedUserSessionsLazyQueryHookResult = ReturnType<typeof useGetAuthenticatedUserSessionsLazyQuery>;
export type GetAuthenticatedUserSessionsQueryResult = Apollo.QueryResult<GetAuthenticatedUserSessionsQuery, GetAuthenticatedUserSessionsQueryVariables>;
export const GetAuthenticatedUserWebAuthnKeysDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getAuthenticatedUserWebAuthnKeys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"webAuthnKeys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"userAgent"}},{"kind":"Field","name":{"kind":"Name","value":"lastUsed"}},{"kind":"Field","name":{"kind":"Name","value":"rawKeyId"}}]}}]}}]}}]} as unknown as DocumentNode;

/**
 * __useGetAuthenticatedUserWebAuthnKeysQuery__
 *
 * To run a query within a React component, call `useGetAuthenticatedUserWebAuthnKeysQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAuthenticatedUserWebAuthnKeysQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAuthenticatedUserWebAuthnKeysQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAuthenticatedUserWebAuthnKeysQuery(baseOptions?: Apollo.QueryHookOptions<GetAuthenticatedUserWebAuthnKeysQuery, GetAuthenticatedUserWebAuthnKeysQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAuthenticatedUserWebAuthnKeysQuery, GetAuthenticatedUserWebAuthnKeysQueryVariables>(GetAuthenticatedUserWebAuthnKeysDocument, options);
      }
export function useGetAuthenticatedUserWebAuthnKeysLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAuthenticatedUserWebAuthnKeysQuery, GetAuthenticatedUserWebAuthnKeysQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAuthenticatedUserWebAuthnKeysQuery, GetAuthenticatedUserWebAuthnKeysQueryVariables>(GetAuthenticatedUserWebAuthnKeysDocument, options);
        }
export type GetAuthenticatedUserWebAuthnKeysQueryHookResult = ReturnType<typeof useGetAuthenticatedUserWebAuthnKeysQuery>;
export type GetAuthenticatedUserWebAuthnKeysLazyQueryHookResult = ReturnType<typeof useGetAuthenticatedUserWebAuthnKeysLazyQuery>;
export type GetAuthenticatedUserWebAuthnKeysQueryResult = Apollo.QueryResult<GetAuthenticatedUserWebAuthnKeysQuery, GetAuthenticatedUserWebAuthnKeysQueryVariables>;
export const RevokeSessionDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"revokeSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ObjectID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"displayNotice"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeUserSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"displayNotice"},"value":{"kind":"Variable","name":{"kind":"Name","value":"displayNotice"}}}]}]}}]} as unknown as DocumentNode;
export type RevokeSessionMutationFn = Apollo.MutationFunction<RevokeSessionMutation, RevokeSessionMutationVariables>;

/**
 * __useRevokeSessionMutation__
 *
 * To run a mutation, you first call `useRevokeSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRevokeSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [revokeSessionMutation, { data, loading, error }] = useRevokeSessionMutation({
 *   variables: {
 *      sessionId: // value for 'sessionId'
 *      displayNotice: // value for 'displayNotice'
 *   },
 * });
 */
export function useRevokeSessionMutation(baseOptions?: Apollo.MutationHookOptions<RevokeSessionMutation, RevokeSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RevokeSessionMutation, RevokeSessionMutationVariables>(RevokeSessionDocument, options);
      }
export type RevokeSessionMutationHookResult = ReturnType<typeof useRevokeSessionMutation>;
export type RevokeSessionMutationResult = Apollo.MutationResult<RevokeSessionMutation>;
export type RevokeSessionMutationOptions = Apollo.BaseMutationOptions<RevokeSessionMutation, RevokeSessionMutationVariables>;
export const AuthenticateDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"authenticate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"username"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authenticate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"username"},"value":{"kind":"Variable","name":{"kind":"Name","value":"username"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthenticationSuccessful"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CurrentUserData"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthenticationRequiresNewPassword"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthenticationRequiresTOTP"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CurrentUserData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"isAuthenticatorEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isPasswordExpired"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"passwordExpiresAt"}}]}}]} as unknown as DocumentNode;
export type AuthenticateMutationFn = Apollo.MutationFunction<AuthenticateMutation, AuthenticateMutationVariables>;

/**
 * __useAuthenticateMutation__
 *
 * To run a mutation, you first call `useAuthenticateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAuthenticateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [authenticateMutation, { data, loading, error }] = useAuthenticateMutation({
 *   variables: {
 *      username: // value for 'username'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useAuthenticateMutation(baseOptions?: Apollo.MutationHookOptions<AuthenticateMutation, AuthenticateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AuthenticateMutation, AuthenticateMutationVariables>(AuthenticateDocument, options);
      }
export type AuthenticateMutationHookResult = ReturnType<typeof useAuthenticateMutation>;
export type AuthenticateMutationResult = Apollo.MutationResult<AuthenticateMutation>;
export type AuthenticateMutationOptions = Apollo.BaseMutationOptions<AuthenticateMutation, AuthenticateMutationVariables>;
export const AuthenticateWithWebAuthnDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"authenticateWithWebAuthn"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"response"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"authenticate"},"name":{"kind":"Name","value":"authenticateWithWebPublicKeyCredential"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}},{"kind":"Argument","name":{"kind":"Name","value":"response"},"value":{"kind":"Variable","name":{"kind":"Name","value":"response"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthenticationSuccessful"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CurrentUserData"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CurrentUserData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"isAuthenticatorEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isPasswordExpired"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"passwordExpiresAt"}}]}}]} as unknown as DocumentNode;
export type AuthenticateWithWebAuthnMutationFn = Apollo.MutationFunction<AuthenticateWithWebAuthnMutation, AuthenticateWithWebAuthnMutationVariables>;

/**
 * __useAuthenticateWithWebAuthnMutation__
 *
 * To run a mutation, you first call `useAuthenticateWithWebAuthnMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAuthenticateWithWebAuthnMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [authenticateWithWebAuthnMutation, { data, loading, error }] = useAuthenticateWithWebAuthnMutation({
 *   variables: {
 *      token: // value for 'token'
 *      response: // value for 'response'
 *   },
 * });
 */
export function useAuthenticateWithWebAuthnMutation(baseOptions?: Apollo.MutationHookOptions<AuthenticateWithWebAuthnMutation, AuthenticateWithWebAuthnMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AuthenticateWithWebAuthnMutation, AuthenticateWithWebAuthnMutationVariables>(AuthenticateWithWebAuthnDocument, options);
      }
export type AuthenticateWithWebAuthnMutationHookResult = ReturnType<typeof useAuthenticateWithWebAuthnMutation>;
export type AuthenticateWithWebAuthnMutationResult = Apollo.MutationResult<AuthenticateWithWebAuthnMutation>;
export type AuthenticateWithWebAuthnMutationOptions = Apollo.BaseMutationOptions<AuthenticateWithWebAuthnMutation, AuthenticateWithWebAuthnMutationVariables>;
export const ChangePasswordFromAuthenticationDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"changePasswordFromAuthentication"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePasswordFromAuthentication"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthenticationSuccessful"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CurrentUserData"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CurrentUserData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"isAuthenticatorEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isPasswordExpired"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"passwordExpiresAt"}}]}}]} as unknown as DocumentNode;
export type ChangePasswordFromAuthenticationMutationFn = Apollo.MutationFunction<ChangePasswordFromAuthenticationMutation, ChangePasswordFromAuthenticationMutationVariables>;

/**
 * __useChangePasswordFromAuthenticationMutation__
 *
 * To run a mutation, you first call `useChangePasswordFromAuthenticationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangePasswordFromAuthenticationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changePasswordFromAuthenticationMutation, { data, loading, error }] = useChangePasswordFromAuthenticationMutation({
 *   variables: {
 *      token: // value for 'token'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useChangePasswordFromAuthenticationMutation(baseOptions?: Apollo.MutationHookOptions<ChangePasswordFromAuthenticationMutation, ChangePasswordFromAuthenticationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangePasswordFromAuthenticationMutation, ChangePasswordFromAuthenticationMutationVariables>(ChangePasswordFromAuthenticationDocument, options);
      }
export type ChangePasswordFromAuthenticationMutationHookResult = ReturnType<typeof useChangePasswordFromAuthenticationMutation>;
export type ChangePasswordFromAuthenticationMutationResult = Apollo.MutationResult<ChangePasswordFromAuthenticationMutation>;
export type ChangePasswordFromAuthenticationMutationOptions = Apollo.BaseMutationOptions<ChangePasswordFromAuthenticationMutation, ChangePasswordFromAuthenticationMutationVariables>;
export const AuthenticateWithTotpDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"authenticateWithTOTP"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authenticateWithTOTP"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthenticationSuccessful"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CurrentUserData"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthenticationRequiresNewPassword"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CurrentUserData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"isAuthenticatorEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isPasswordExpired"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"passwordExpiresAt"}}]}}]} as unknown as DocumentNode;
export type AuthenticateWithTotpMutationFn = Apollo.MutationFunction<AuthenticateWithTotpMutation, AuthenticateWithTotpMutationVariables>;

/**
 * __useAuthenticateWithTotpMutation__
 *
 * To run a mutation, you first call `useAuthenticateWithTotpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAuthenticateWithTotpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [authenticateWithTotpMutation, { data, loading, error }] = useAuthenticateWithTotpMutation({
 *   variables: {
 *      token: // value for 'token'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useAuthenticateWithTotpMutation(baseOptions?: Apollo.MutationHookOptions<AuthenticateWithTotpMutation, AuthenticateWithTotpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AuthenticateWithTotpMutation, AuthenticateWithTotpMutationVariables>(AuthenticateWithTotpDocument, options);
      }
export type AuthenticateWithTotpMutationHookResult = ReturnType<typeof useAuthenticateWithTotpMutation>;
export type AuthenticateWithTotpMutationResult = Apollo.MutationResult<AuthenticateWithTotpMutation>;
export type AuthenticateWithTotpMutationOptions = Apollo.BaseMutationOptions<AuthenticateWithTotpMutation, AuthenticateWithTotpMutationVariables>;
export const RefreshCredentialsDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"refreshCredentials"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshCredentials"}}]}}]} as unknown as DocumentNode;
export type RefreshCredentialsMutationFn = Apollo.MutationFunction<RefreshCredentialsMutation, RefreshCredentialsMutationVariables>;

/**
 * __useRefreshCredentialsMutation__
 *
 * To run a mutation, you first call `useRefreshCredentialsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRefreshCredentialsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [refreshCredentialsMutation, { data, loading, error }] = useRefreshCredentialsMutation({
 *   variables: {
 *   },
 * });
 */
export function useRefreshCredentialsMutation(baseOptions?: Apollo.MutationHookOptions<RefreshCredentialsMutation, RefreshCredentialsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RefreshCredentialsMutation, RefreshCredentialsMutationVariables>(RefreshCredentialsDocument, options);
      }
export type RefreshCredentialsMutationHookResult = ReturnType<typeof useRefreshCredentialsMutation>;
export type RefreshCredentialsMutationResult = Apollo.MutationResult<RefreshCredentialsMutation>;
export type RefreshCredentialsMutationOptions = Apollo.BaseMutationOptions<RefreshCredentialsMutation, RefreshCredentialsMutationVariables>;
export const ApplyForPasswordChangeDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"applyForPasswordChange"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"username"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"applyForPasswordChange"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"username"},"value":{"kind":"Variable","name":{"kind":"Name","value":"username"}}}]}]}}]} as unknown as DocumentNode;
export type ApplyForPasswordChangeMutationFn = Apollo.MutationFunction<ApplyForPasswordChangeMutation, ApplyForPasswordChangeMutationVariables>;

/**
 * __useApplyForPasswordChangeMutation__
 *
 * To run a mutation, you first call `useApplyForPasswordChangeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApplyForPasswordChangeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [applyForPasswordChangeMutation, { data, loading, error }] = useApplyForPasswordChangeMutation({
 *   variables: {
 *      username: // value for 'username'
 *   },
 * });
 */
export function useApplyForPasswordChangeMutation(baseOptions?: Apollo.MutationHookOptions<ApplyForPasswordChangeMutation, ApplyForPasswordChangeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ApplyForPasswordChangeMutation, ApplyForPasswordChangeMutationVariables>(ApplyForPasswordChangeDocument, options);
      }
export type ApplyForPasswordChangeMutationHookResult = ReturnType<typeof useApplyForPasswordChangeMutation>;
export type ApplyForPasswordChangeMutationResult = Apollo.MutationResult<ApplyForPasswordChangeMutation>;
export type ApplyForPasswordChangeMutationOptions = Apollo.BaseMutationOptions<ApplyForPasswordChangeMutation, ApplyForPasswordChangeMutationVariables>;
export const ChangePasswordFromTokenDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"changePasswordFromToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePasswordFromToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}]}]}}]} as unknown as DocumentNode;
export type ChangePasswordFromTokenMutationFn = Apollo.MutationFunction<ChangePasswordFromTokenMutation, ChangePasswordFromTokenMutationVariables>;

/**
 * __useChangePasswordFromTokenMutation__
 *
 * To run a mutation, you first call `useChangePasswordFromTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangePasswordFromTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changePasswordFromTokenMutation, { data, loading, error }] = useChangePasswordFromTokenMutation({
 *   variables: {
 *      token: // value for 'token'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useChangePasswordFromTokenMutation(baseOptions?: Apollo.MutationHookOptions<ChangePasswordFromTokenMutation, ChangePasswordFromTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangePasswordFromTokenMutation, ChangePasswordFromTokenMutationVariables>(ChangePasswordFromTokenDocument, options);
      }
export type ChangePasswordFromTokenMutationHookResult = ReturnType<typeof useChangePasswordFromTokenMutation>;
export type ChangePasswordFromTokenMutationResult = Apollo.MutationResult<ChangePasswordFromTokenMutation>;
export type ChangePasswordFromTokenMutationOptions = Apollo.BaseMutationOptions<ChangePasswordFromTokenMutation, ChangePasswordFromTokenMutationVariables>;
export const ListUsersDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"listUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UserSortingRule"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"list"},"name":{"kind":"Name","value":"listUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserListData"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserListData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isAuthenticatorEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isPasswordExpired"}}]}}]} as unknown as DocumentNode;

/**
 * __useListUsersQuery__
 *
 * To run a query within a React component, call `useListUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useListUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListUsersQuery({
 *   variables: {
 *      pagination: // value for 'pagination'
 *      sort: // value for 'sort'
 *   },
 * });
 */
export function useListUsersQuery(baseOptions: Apollo.QueryHookOptions<ListUsersQuery, ListUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListUsersQuery, ListUsersQueryVariables>(ListUsersDocument, options);
      }
export function useListUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListUsersQuery, ListUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListUsersQuery, ListUsersQueryVariables>(ListUsersDocument, options);
        }
export type ListUsersQueryHookResult = ReturnType<typeof useListUsersQuery>;
export type ListUsersLazyQueryHookResult = ReturnType<typeof useListUsersLazyQuery>;
export type ListUsersQueryResult = Apollo.QueryResult<ListUsersQuery, ListUsersQueryVariables>;
export const GenerateAuthenticatorSetupDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"generateAuthenticatorSetup"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"response"},"name":{"kind":"Name","value":"generateAuthenticatorSetup"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"secret"}},{"kind":"Field","name":{"kind":"Name","value":"qrcodeUri"}}]}}]}}]} as unknown as DocumentNode;

/**
 * __useGenerateAuthenticatorSetupQuery__
 *
 * To run a query within a React component, call `useGenerateAuthenticatorSetupQuery` and pass it any options that fit your needs.
 * When your component renders, `useGenerateAuthenticatorSetupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGenerateAuthenticatorSetupQuery({
 *   variables: {
 *   },
 * });
 */
export function useGenerateAuthenticatorSetupQuery(baseOptions?: Apollo.QueryHookOptions<GenerateAuthenticatorSetupQuery, GenerateAuthenticatorSetupQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GenerateAuthenticatorSetupQuery, GenerateAuthenticatorSetupQueryVariables>(GenerateAuthenticatorSetupDocument, options);
      }
export function useGenerateAuthenticatorSetupLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GenerateAuthenticatorSetupQuery, GenerateAuthenticatorSetupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GenerateAuthenticatorSetupQuery, GenerateAuthenticatorSetupQueryVariables>(GenerateAuthenticatorSetupDocument, options);
        }
export type GenerateAuthenticatorSetupQueryHookResult = ReturnType<typeof useGenerateAuthenticatorSetupQuery>;
export type GenerateAuthenticatorSetupLazyQueryHookResult = ReturnType<typeof useGenerateAuthenticatorSetupLazyQuery>;
export type GenerateAuthenticatorSetupQueryResult = Apollo.QueryResult<GenerateAuthenticatorSetupQuery, GenerateAuthenticatorSetupQueryVariables>;
export const EnableAuthenticatorDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"enableAuthenticator"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"secret"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enableAuthenticator"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"secret"},"value":{"kind":"Variable","name":{"kind":"Name","value":"secret"}}},{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CurrentUserData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CurrentUserData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"isAuthenticatorEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isPasswordExpired"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"passwordExpiresAt"}}]}}]} as unknown as DocumentNode;
export type EnableAuthenticatorMutationFn = Apollo.MutationFunction<EnableAuthenticatorMutation, EnableAuthenticatorMutationVariables>;

/**
 * __useEnableAuthenticatorMutation__
 *
 * To run a mutation, you first call `useEnableAuthenticatorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEnableAuthenticatorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [enableAuthenticatorMutation, { data, loading, error }] = useEnableAuthenticatorMutation({
 *   variables: {
 *      secret: // value for 'secret'
 *      token: // value for 'token'
 *   },
 * });
 */
export function useEnableAuthenticatorMutation(baseOptions?: Apollo.MutationHookOptions<EnableAuthenticatorMutation, EnableAuthenticatorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EnableAuthenticatorMutation, EnableAuthenticatorMutationVariables>(EnableAuthenticatorDocument, options);
      }
export type EnableAuthenticatorMutationHookResult = ReturnType<typeof useEnableAuthenticatorMutation>;
export type EnableAuthenticatorMutationResult = Apollo.MutationResult<EnableAuthenticatorMutation>;
export type EnableAuthenticatorMutationOptions = Apollo.BaseMutationOptions<EnableAuthenticatorMutation, EnableAuthenticatorMutationVariables>;
export const DisableAuthenticatorDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"disableAuthenticator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"disableAuthenticator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CurrentUserData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CurrentUserData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"isAuthenticatorEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isPasswordExpired"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"passwordExpiresAt"}}]}}]} as unknown as DocumentNode;
export type DisableAuthenticatorMutationFn = Apollo.MutationFunction<DisableAuthenticatorMutation, DisableAuthenticatorMutationVariables>;

/**
 * __useDisableAuthenticatorMutation__
 *
 * To run a mutation, you first call `useDisableAuthenticatorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDisableAuthenticatorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [disableAuthenticatorMutation, { data, loading, error }] = useDisableAuthenticatorMutation({
 *   variables: {
 *   },
 * });
 */
export function useDisableAuthenticatorMutation(baseOptions?: Apollo.MutationHookOptions<DisableAuthenticatorMutation, DisableAuthenticatorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DisableAuthenticatorMutation, DisableAuthenticatorMutationVariables>(DisableAuthenticatorDocument, options);
      }
export type DisableAuthenticatorMutationHookResult = ReturnType<typeof useDisableAuthenticatorMutation>;
export type DisableAuthenticatorMutationResult = Apollo.MutationResult<DisableAuthenticatorMutation>;
export type DisableAuthenticatorMutationOptions = Apollo.BaseMutationOptions<DisableAuthenticatorMutation, DisableAuthenticatorMutationVariables>;
export const GenerateAuthenticatorChallengeDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"generateAuthenticatorChallenge"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"username"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateAuthenticatorChallenge"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"username"},"value":{"kind":"Variable","name":{"kind":"Name","value":"username"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"challenge"}},{"kind":"Field","name":{"kind":"Name","value":"allowCredentials"}},{"kind":"Field","name":{"kind":"Name","value":"timeout"}}]}}]}}]} as unknown as DocumentNode;

/**
 * __useGenerateAuthenticatorChallengeQuery__
 *
 * To run a query within a React component, call `useGenerateAuthenticatorChallengeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGenerateAuthenticatorChallengeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGenerateAuthenticatorChallengeQuery({
 *   variables: {
 *      username: // value for 'username'
 *   },
 * });
 */
export function useGenerateAuthenticatorChallengeQuery(baseOptions: Apollo.QueryHookOptions<GenerateAuthenticatorChallengeQuery, GenerateAuthenticatorChallengeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GenerateAuthenticatorChallengeQuery, GenerateAuthenticatorChallengeQueryVariables>(GenerateAuthenticatorChallengeDocument, options);
      }
export function useGenerateAuthenticatorChallengeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GenerateAuthenticatorChallengeQuery, GenerateAuthenticatorChallengeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GenerateAuthenticatorChallengeQuery, GenerateAuthenticatorChallengeQueryVariables>(GenerateAuthenticatorChallengeDocument, options);
        }
export type GenerateAuthenticatorChallengeQueryHookResult = ReturnType<typeof useGenerateAuthenticatorChallengeQuery>;
export type GenerateAuthenticatorChallengeLazyQueryHookResult = ReturnType<typeof useGenerateAuthenticatorChallengeLazyQuery>;
export type GenerateAuthenticatorChallengeQueryResult = Apollo.QueryResult<GenerateAuthenticatorChallengeQuery, GenerateAuthenticatorChallengeQueryVariables>;
export const RevokeWebPublicKeyCredentialDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"revokeWebPublicKeyCredential"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ObjectID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeWebPublicKeyCredential"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyId"}}}]}]}}]} as unknown as DocumentNode;
export type RevokeWebPublicKeyCredentialMutationFn = Apollo.MutationFunction<RevokeWebPublicKeyCredentialMutation, RevokeWebPublicKeyCredentialMutationVariables>;

/**
 * __useRevokeWebPublicKeyCredentialMutation__
 *
 * To run a mutation, you first call `useRevokeWebPublicKeyCredentialMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRevokeWebPublicKeyCredentialMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [revokeWebPublicKeyCredentialMutation, { data, loading, error }] = useRevokeWebPublicKeyCredentialMutation({
 *   variables: {
 *      keyId: // value for 'keyId'
 *   },
 * });
 */
export function useRevokeWebPublicKeyCredentialMutation(baseOptions?: Apollo.MutationHookOptions<RevokeWebPublicKeyCredentialMutation, RevokeWebPublicKeyCredentialMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RevokeWebPublicKeyCredentialMutation, RevokeWebPublicKeyCredentialMutationVariables>(RevokeWebPublicKeyCredentialDocument, options);
      }
export type RevokeWebPublicKeyCredentialMutationHookResult = ReturnType<typeof useRevokeWebPublicKeyCredentialMutation>;
export type RevokeWebPublicKeyCredentialMutationResult = Apollo.MutationResult<RevokeWebPublicKeyCredentialMutation>;
export type RevokeWebPublicKeyCredentialMutationOptions = Apollo.BaseMutationOptions<RevokeWebPublicKeyCredentialMutation, RevokeWebPublicKeyCredentialMutationVariables>;
export const RequestWebPublicKeyCredentialRegistrationDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"requestWebPublicKeyCredentialRegistration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestWebPublicKeyCredentialRegistration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"options"}}]}}]}}]} as unknown as DocumentNode;
export type RequestWebPublicKeyCredentialRegistrationMutationFn = Apollo.MutationFunction<RequestWebPublicKeyCredentialRegistrationMutation, RequestWebPublicKeyCredentialRegistrationMutationVariables>;

/**
 * __useRequestWebPublicKeyCredentialRegistrationMutation__
 *
 * To run a mutation, you first call `useRequestWebPublicKeyCredentialRegistrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestWebPublicKeyCredentialRegistrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestWebPublicKeyCredentialRegistrationMutation, { data, loading, error }] = useRequestWebPublicKeyCredentialRegistrationMutation({
 *   variables: {
 *   },
 * });
 */
export function useRequestWebPublicKeyCredentialRegistrationMutation(baseOptions?: Apollo.MutationHookOptions<RequestWebPublicKeyCredentialRegistrationMutation, RequestWebPublicKeyCredentialRegistrationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RequestWebPublicKeyCredentialRegistrationMutation, RequestWebPublicKeyCredentialRegistrationMutationVariables>(RequestWebPublicKeyCredentialRegistrationDocument, options);
      }
export type RequestWebPublicKeyCredentialRegistrationMutationHookResult = ReturnType<typeof useRequestWebPublicKeyCredentialRegistrationMutation>;
export type RequestWebPublicKeyCredentialRegistrationMutationResult = Apollo.MutationResult<RequestWebPublicKeyCredentialRegistrationMutation>;
export type RequestWebPublicKeyCredentialRegistrationMutationOptions = Apollo.BaseMutationOptions<RequestWebPublicKeyCredentialRegistrationMutation, RequestWebPublicKeyCredentialRegistrationMutationVariables>;
export const CompleteWebPublicKeyCredentialRegistrationDocument = /*#__PURE__*/ {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"completeWebPublicKeyCredentialRegistration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"response"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeWebPublicKeyCredentialRegistration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}},{"kind":"Argument","name":{"kind":"Name","value":"response"},"value":{"kind":"Variable","name":{"kind":"Name","value":"response"}}}]}]}}]} as unknown as DocumentNode;
export type CompleteWebPublicKeyCredentialRegistrationMutationFn = Apollo.MutationFunction<CompleteWebPublicKeyCredentialRegistrationMutation, CompleteWebPublicKeyCredentialRegistrationMutationVariables>;

/**
 * __useCompleteWebPublicKeyCredentialRegistrationMutation__
 *
 * To run a mutation, you first call `useCompleteWebPublicKeyCredentialRegistrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCompleteWebPublicKeyCredentialRegistrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [completeWebPublicKeyCredentialRegistrationMutation, { data, loading, error }] = useCompleteWebPublicKeyCredentialRegistrationMutation({
 *   variables: {
 *      token: // value for 'token'
 *      response: // value for 'response'
 *   },
 * });
 */
export function useCompleteWebPublicKeyCredentialRegistrationMutation(baseOptions?: Apollo.MutationHookOptions<CompleteWebPublicKeyCredentialRegistrationMutation, CompleteWebPublicKeyCredentialRegistrationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CompleteWebPublicKeyCredentialRegistrationMutation, CompleteWebPublicKeyCredentialRegistrationMutationVariables>(CompleteWebPublicKeyCredentialRegistrationDocument, options);
      }
export type CompleteWebPublicKeyCredentialRegistrationMutationHookResult = ReturnType<typeof useCompleteWebPublicKeyCredentialRegistrationMutation>;
export type CompleteWebPublicKeyCredentialRegistrationMutationResult = Apollo.MutationResult<CompleteWebPublicKeyCredentialRegistrationMutation>;
export type CompleteWebPublicKeyCredentialRegistrationMutationOptions = Apollo.BaseMutationOptions<CompleteWebPublicKeyCredentialRegistrationMutation, CompleteWebPublicKeyCredentialRegistrationMutationVariables>;
import { ApolloError, gql } from '@apollo/client';
import Dayjs from 'dayjs';
import { authenticator } from 'otplib';
import { authenticationRateLimiter } from '../../server/core/rateLimiter';
import { getDatabaseContext, OTPKind } from '../../server/database';
import { readSessionToken } from '../../server/schema/session';
import {
    cleanDatabase,
    composeHandlers,
    getApolloClient,
    loadFixtures,
    setupDatabase,
    setupWebService,
} from '../helpers';
import fixtures from './authenticate.fixture.json';

const authenticateMutation = gql`
    mutation test($username: String!, $password: String!) {
        response: authenticate(username: $username, password: $password) {
            __typename

            ... on AuthenticationSuccessful {
                user {
                    id
                }
                token
            }

            ... on AuthenticationRequiresTOTP {
                token
            }

            ... on AuthenticationRequiresNewPassword {
                token
            }
        }
    }
`;

const totpMutation = gql`
    mutation test($token: String!, $password: String!) {
        response: authenticateWithTOTP(token: $token, password: $password) {
            __typename

            ... on AuthenticationSuccessful {
                user {
                    id
                }
                token
            }

            ... on AuthenticationRequiresNewPassword {
                token
            }
        }
    }
`;

const passwordChangeMutation = gql`
    mutation test($token: String!, $password: String!) {
        response: changePasswordFromAuthentication(token: $token, password: $password) {
            __typename

            ... on AuthenticationSuccessful {
                user {
                    id
                }
                token
            }
        }
    }
`;

const resetRateLimiter = async () => {
    await authenticationRateLimiter.delete('::ffff:127.0.0.1');
    await authenticationRateLimiter.delete('x');
    await authenticationRateLimiter.delete('unknown');
};

const webService = setupWebService();

beforeEach(composeHandlers(setupDatabase, loadFixtures(fixtures), webService.initialize, resetRateLimiter));

afterEach(composeHandlers(cleanDatabase, webService.cleanUp));

test('Authentication rejects invalid credentials because the user does not exist', async () => {
    const { client } = getApolloClient(webService.url);
    const variables = { username: 'unknown', password: 'something' };
    const promise = client.mutate({ mutation: authenticateMutation, variables });
    await expect(promise).rejects.toBeInstanceOf(ApolloError);
    const error: ApolloError = await promise.catch(error => error);
    expect(error.graphQLErrors).toMatchSnapshot();
});

test('Authentication rejects invalid credentials because the password does not match', async () => {
    const { client } = getApolloClient(webService.url);
    const variables = { username: 'x', password: 'something' };
    const promise = client.mutate({ mutation: authenticateMutation, variables });
    await expect(promise).rejects.toBeInstanceOf(ApolloError);
    const error: ApolloError = await promise.catch(error => error);
    expect(error.graphQLErrors).toMatchSnapshot();
});

test('Authentication returns the user and token on valid credentials', async () => {
    const { collections } = await getDatabaseContext();
    await collections.users.updateOne({ username: 'x' }, { $set: { passwordFrom: new Date() } });
    const { client, getCSRF } = getApolloClient(webService.url);
    const variables = { username: 'x', password: 'y' };
    const { data } = await client.mutate({ mutation: authenticateMutation, variables });
    expect(data.response.__typename).toEqual('AuthenticationSuccessful');
    expect(data.response.user).toMatchSnapshot();
    const sessionData = await readSessionToken(data.response.token, getCSRF());
    expect(sessionData.userId).toMatchSnapshot();
});

test('Authentication returns a request to renew password after expiry', async () => {
    const { collections } = await getDatabaseContext();
    const date = Dayjs().subtract(91, 'day').toDate();
    await collections.users.updateOne({ username: 'x' }, { $set: { passwordFrom: date } });
    const { client } = getApolloClient(webService.url);
    const variables = { username: 'x', password: 'y' };
    const { data } = await client.mutate({ mutation: authenticateMutation, variables });
    expect(data.response.__typename).toEqual('AuthenticationRequiresNewPassword');
    expect(data.response.token).not.toBeNull();
});

test('Authentication returns a request for TOTP when enabled before password expiry check', async () => {
    const { collections } = await getDatabaseContext();
    const date = Dayjs().subtract(91, 'day').toDate();
    const totpSecret = authenticator.generateSecret();
    await collections.users.updateOne(
        { username: 'x' },
        { $set: { passwordFrom: date, otpSetup: { kind: OTPKind.TOTP, secret: totpSecret } } }
    );
    const { client } = getApolloClient(webService.url);
    const variables = { username: 'x', password: 'y' };
    const { data } = await client.mutate({ mutation: authenticateMutation, variables });
    expect(data.response.__typename).toEqual('AuthenticationRequiresTOTP');
    expect(data.response.token).not.toBeNull();
});

test('Authentication returns a request for TOTP when enabled and when password is still valid', async () => {
    const { collections } = await getDatabaseContext();
    const totpSecret = authenticator.generateSecret();
    await collections.users.updateOne(
        { username: 'x' },
        { $set: { passwordFrom: new Date(), otpSetup: { kind: OTPKind.TOTP, secret: totpSecret } } }
    );
    const { client } = getApolloClient(webService.url);
    const variables = { username: 'x', password: 'y' };
    const { data } = await client.mutate({ mutation: authenticateMutation, variables });
    expect(data.response.__typename).toEqual('AuthenticationRequiresTOTP');
    expect(data.response.token).not.toBeNull();
});

test('Authentication is successful with TOTP', async () => {
    const { collections } = await getDatabaseContext();
    const totpSecret = authenticator.generateSecret();
    const passwordFrom = new Date();
    await collections.users.updateOne(
        { username: 'x' },
        { $set: { passwordFrom, otpSetup: { kind: OTPKind.TOTP, secret: totpSecret } } }
    );
    const { client, getCSRF } = getApolloClient(webService.url);
    const { data: authenticateData } = await client.mutate({
        mutation: authenticateMutation,
        variables: { username: 'x', password: 'y' },
    });
    expect(authenticateData.response.__typename).toEqual('AuthenticationRequiresTOTP');
    expect(authenticateData.response.token).not.toBeNull();
    const { data: totpData } = await client.mutate({
        mutation: totpMutation,
        variables: { token: authenticateData.response.token, password: authenticator.generate(totpSecret) },
    });
    expect(totpData.response.__typename).toEqual('AuthenticationSuccessful');
    expect(totpData.response.user).toMatchSnapshot();
    const sessionData = await readSessionToken(totpData.response.token, getCSRF());
    expect(sessionData.userId).toMatchSnapshot();
});

test('Authentication is successful with TOTP and password renewal', async () => {
    const { collections } = await getDatabaseContext();
    const totpSecret = authenticator.generateSecret();
    const passwordFrom = Dayjs().subtract(91, 'day').toDate();
    await collections.users.updateOne(
        { username: 'x' },
        { $set: { passwordFrom, otpSetup: { kind: OTPKind.TOTP, secret: totpSecret } } }
    );
    const { client, getCSRF } = getApolloClient(webService.url);
    const { data: authenticateData } = await client.mutate({
        mutation: authenticateMutation,
        variables: { username: 'x', password: 'y' },
    });
    expect(authenticateData.response.__typename).toEqual('AuthenticationRequiresTOTP');
    expect(authenticateData.response.token).not.toBeNull();
    const { data: totpData } = await client.mutate({
        mutation: totpMutation,
        variables: { token: authenticateData.response.token, password: authenticator.generate(totpSecret) },
    });
    expect(totpData.response.__typename).toEqual('AuthenticationRequiresNewPassword');
    expect(totpData.response.token).not.toBeNull();
    const { data: passwordData } = await client.mutate({
        mutation: passwordChangeMutation,
        variables: { token: totpData.response.token, password: 'S%1209!jagqo712oPI' },
    });
    expect(passwordData.response.__typename).toEqual('AuthenticationSuccessful');
    expect(passwordData.response.user).toMatchSnapshot();
    const sessionData = await readSessionToken(passwordData.response.token, getCSRF());
    expect(sessionData.userId).toMatchSnapshot();
});

import { gql, ApolloError } from '@apollo/client';
import { readSessionToken } from '../../server/schema/session';
import {
    composeHandlers,
    loadFixtures,
    setupDatabase,
    cleanDatabase,
    setupWebService,
    getApolloClient,
} from '../helpers';
import fixtures from './authenticate.fixture.json';

const mutation = gql`
    mutation test($username: String!, $password: String!) {
        authenticate(username: $username, password: $password) {
            user {
                id
            }
            token
        }
    }
`;

const webService = setupWebService();

beforeEach(composeHandlers(setupDatabase, loadFixtures(fixtures), webService.initialize));

afterEach(composeHandlers(cleanDatabase, webService.cleanUp));

test('Authentication rejects invalid credentials because the user does not exist', async () => {
    const client = getApolloClient(webService.url);
    const variables = { username: 'unknown', password: 'something' };
    const promise = client.mutate({ mutation, variables });
    await expect(promise).rejects.toBeInstanceOf(ApolloError);
    const error: ApolloError = await promise.catch(error => error);
    expect(error.graphQLErrors).toMatchSnapshot();
});

test('Authentication rejects invalid credentials because the password does not match', async () => {
    const client = getApolloClient(webService.url);
    const variables = { username: 'x', password: 'something' };
    const promise = client.mutate({ mutation, variables });
    await expect(promise).rejects.toBeInstanceOf(ApolloError);
    const error: ApolloError = await promise.catch(error => error);
    expect(error.graphQLErrors).toMatchSnapshot();
});

test('Authentication returns the user and token on valid credentials', async () => {
    const client = getApolloClient(webService.url);
    const variables = { username: 'x', password: 'y' };
    const { data } = await client.mutate({ mutation, variables });
    expect(data.authenticate.user).toMatchSnapshot();
    const sessionData = await readSessionToken(data.authenticate.token);
    expect(sessionData.userId).toMatchSnapshot();
});

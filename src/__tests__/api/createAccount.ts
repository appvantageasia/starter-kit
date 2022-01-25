import { gql, ApolloError } from '@apollo/client';
import { compare } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getDatabaseContext } from '../../server/database';
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
    mutation test($username: String!, $password: String!, $email: String!) {
        createAccount(username: $username, password: $password, email: $email) {
            id
        }
    }
`;

const webService = setupWebService();

beforeEach(composeHandlers(setupDatabase, loadFixtures(fixtures), webService.initialize));

afterEach(composeHandlers(cleanDatabase, webService.cleanUp));

test('Create account rejects weak passwords', async () => {
    const { client } = getApolloClient(webService.url);
    const variables = { username: 'x', password: 'y', email: 'test@test.fr' };
    const promise = client.mutate({ mutation, variables });
    await expect(promise).rejects.toBeInstanceOf(ApolloError);
    const error: ApolloError = await promise.catch(error => error);
    expect(error.graphQLErrors).toMatchSnapshot();
});

test('Create account rejects on duplicate username', async () => {
    const { client } = getApolloClient(webService.url);
    const variables = { username: 'x', password: 'super0923582357word', email: 'test@test.fr' };
    const promise = client.mutate({ mutation, variables });
    await expect(promise).rejects.toBeInstanceOf(ApolloError);
    const error: ApolloError = await promise.catch(error => error);
    expect(error.graphQLErrors).toMatchSnapshot();
});

test('Create account successfully create a new user on valid inputs', async () => {
    const { client } = getApolloClient(webService.url);
    const variables = { username: 'newUser', password: 'super0923582357word', email: 'test@test.fr' };
    const { data } = await client.mutate({ mutation, variables });
    const userId = new ObjectId(data.createAccount.id);
    const { collections } = await getDatabaseContext();
    const user = await collections.users.findOne({ _id: userId });
    expect(user).not.toBeNull();
    expect(user.username).toBe(variables.username);
    expect(user.displayName).toBe(variables.username);
    await expect(compare(variables.password, user.password)).resolves.toBe(true);
});

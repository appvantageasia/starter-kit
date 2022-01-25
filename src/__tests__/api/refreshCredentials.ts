import { gql, ApolloError } from '@apollo/client';
import { ObjectId } from 'mongodb';
import { readSessionToken } from '../../server/schema/session';
import {
    composeHandlers,
    loadFixtures,
    setupDatabase,
    cleanDatabase,
    setupWebService,
    getApolloClient,
    createSessionForUser,
} from '../helpers';
import fixtures from './authenticate.fixture.json';

const mutation = gql`
    mutation {
        refreshCredentials
    }
`;

const webService = setupWebService();

beforeEach(composeHandlers(setupDatabase, loadFixtures(fixtures), webService.initialize));

afterEach(composeHandlers(cleanDatabase, webService.cleanUp));

test('Refresh credentials requires authorizations', async () => {
    const { client } = getApolloClient(webService.url);
    const promise = client.mutate({ mutation });
    await expect(promise).rejects.toBeInstanceOf(ApolloError);
    const error: ApolloError = await promise.catch(error => error);
    expect(error.graphQLErrors).toMatchSnapshot();
});

test('Refresh credentials returns a new token with the same payload', async () => {
    const userId = new ObjectId('601f7ae763d6cfc2554f6b67');
    const { token: originalToken, csrf } = await createSessionForUser(userId);
    const { client, getCSRF } = getApolloClient(webService.url, { authorizationToken: originalToken, csrf });
    const response = await client.mutate({ mutation });
    const sessionData = await readSessionToken(response.data.refreshCredentials, getCSRF());
    expect(sessionData.userId.toHexString()).toStrictEqual(userId.toHexString());
});

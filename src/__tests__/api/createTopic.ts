import path from 'path';
import { gql, ApolloError } from '@apollo/client';
import { ObjectId } from 'mongodb';
import { getDatabaseContext } from '../../server/database';
import { getSessionToken, SessionData } from '../../server/schema/session';
import {
    composeHandlers,
    loadFixtures,
    setupDatabase,
    cleanDatabase,
    setupWebService,
    getApolloClient,
    setupEmptyBucket,
    createBlobFrom,
} from '../helpers';
import fixtures from './authenticate.fixture.json';

const mutation = gql`
    mutation test($title: String!, $body: String!, $files: [Upload!]) {
        createTopic(title: $title, body: $body, attachments: $files) {
            id
        }
    }
`;

const webService = setupWebService();

beforeEach(composeHandlers(setupEmptyBucket, setupDatabase, loadFixtures(fixtures), webService.initialize));

afterEach(composeHandlers(cleanDatabase, webService.cleanUp));

test('Create topic requires authorizations', async () => {
    const { client } = getApolloClient(webService.url);
    const variables = { title: 'test', body: 'this is a test' };
    const promise = client.mutate({ mutation, variables });
    await expect(promise).rejects.toBeInstanceOf(ApolloError);
    const error: ApolloError = await promise.catch(error => error);
    expect(error.graphQLErrors).toMatchSnapshot();
});

test('Create topic work successfully without attachments', async () => {
    const originalData: SessionData = { userId: new ObjectId('601f7ae763d6cfc2554f6b67') };
    const { token: originalToken, csrf } = await getSessionToken(originalData);
    const { client } = getApolloClient(webService.url, { authorizationToken: originalToken, csrf });
    const variables = { title: 'test', body: 'this is a test' };
    const { data } = await client.mutate({ mutation, variables });
    expect(data.createTopic).not.toBeNull();
    expect(data.createTopic.id).not.toBeNull();
    const { collections } = await getDatabaseContext();
    const topic = await collections.topics.findOne({ _id: new ObjectId(data.createTopic.id) });
    expect(topic).not.toBeNull();
    expect(topic.title).toEqual(variables.title);
    expect(topic.body).toEqual(variables.body);
    expect(topic.attachments).toHaveLength(0);
    expect(topic.authorId.toHexString()).toEqual(originalData.userId.toHexString());
});

test('Create topic work successfully with attachments', async () => {
    const originalData: SessionData = { userId: new ObjectId('601f7ae763d6cfc2554f6b67') };
    const { token: originalToken, csrf } = await getSessionToken(originalData);
    const { client } = getApolloClient(webService.url, { authorizationToken: originalToken, csrf });
    const originalFile = await createBlobFrom(path.resolve(__dirname, './img.png'));
    const variables = { title: 'test', body: 'this is a test', files: [originalFile] };
    const { data } = await client.mutate({ mutation, variables });
    expect(data.createTopic).not.toBeNull();
    expect(data.createTopic.id).not.toBeNull();
    const { collections } = await getDatabaseContext();
    const topic = await collections.topics.findOne({ _id: new ObjectId(data.createTopic.id) });
    expect(topic).not.toBeNull();
    expect(topic.title).toEqual(variables.title);
    expect(topic.body).toEqual(variables.body);
    expect(topic.attachments).toHaveLength(1);
    expect(topic.authorId.toHexString()).toEqual(originalData.userId.toHexString());
});

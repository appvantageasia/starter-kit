# Unit testing

Components, API resolvers and any other core functions may be tested individually by
writing unit tests based on [Jest][jest]. Tests are grouped in `src/__tests__`.
The tests must be executed in bands to allow concurrent conflict when using the database.
When running test the `NODE_ENV` should be defined to `test`.
Running the command line `yarn test` will do it for you.

Some custom helpers are available for testing.

[jest]: https://jestjs.io

## setupDatabase

You may get the database ready for your testing by using `setupDatabase` and `cleanDatabase`

```typescript
import { setupDatabase, cleanDatabase } from './helpers';

// it will connect to the database and execute migration
beforeEach(setupDatabase);

// it will fully drop the database and close the connections
afterEach(cleanDatabase);
```

## setupWebService

You may start the web server onto a free port by using `setupWebService`.

```typescript
import { setupWebService } from './helpers';

// create an instance for manage a web service serving the backend server
const webService = setupWebService();

// start the server
beforeEach(webService.initialize);

// stop the server
afterEach(webService.cleanUp);

test('dummyTest', () => {
    // get the url on which the web server is serving
    const url = webService.url;
});
```

## loadFixtures

After using `setupDatabase` you may chain it to load fixtures with `loadFixtures`.
The fixture must be wrote in EJSON.

```typescript
import { composeHandlers, setupDatabase, cleanDatabase, loadFixtures } from './helpers';
import dummyFixtures from './dummy.fixture.json';

// it will first connect to the database, execute migration then load fictures as given
beforeEach(composeHandlers(setupDatabase, loadFixtures(dummyFixtures)));

// it will fully drop the database and close the connections
afterEach(cleanDatabase);
```

## setupEmptyBucket

You may ensure there's a bucket matching your configuration with an empty content by using `setupEmptyBucket`.

```typescript
import { setupEmptyBucket } from './helpers';

// it will ensure the bucket exist and drop anything already there
beforeEach(setupEmptyBucket);
```

## getApolloClient

You may get the apollo client with `getApolloClient`

```typescript
import { setupWebService } from './helpers';
import dummyFixtures from './dummy.fixture.json';

const webService = setupWebService();

// get things ready
beforeEach(webService.initialize);

// then clean up
afterEach(webService.cleanUp);

test('test', async () => {
    // get the apollo client
    const client = getApolloClient(webService.url);
    // do testing...
});
```

## createBlobFrom

You may upload files over GraphQL requests by using `createBlobFrom`.

```typescript
import { composeHandlers, setupWebService } from './helpers';
import dummyFixtures from './dummy.fixture.json';

const webService = setupWebService();

// get things ready
beforeEach(composeHandlers(webService.initialize));

// then clean up
afterEach(composeHandlers(webService.cleanUp));

test('test image', async () => {
    // get the apollo client
    const client = getApolloClient(webService.url);
    // get the file ready for upload
    const originalFile = await createBlobFrom(path.resolve(__dirname, './img.png'));
    // add it to variable
    const variables = { files: [originalFile] };
    // execute
    const { data } = await client.mutate({ mutation, variables });
});
```

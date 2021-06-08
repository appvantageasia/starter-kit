# Functional testing

The application may be fully tested by writing and running functional tests based on [Cypress][cypress].

To run unit testing simply execute the following command line

```bash
yarn test
# or with code coverage reports
yarn test:coverage
```

To run functional testing you need first to start the server on test mode

```bash
# start the server
NODE_ENV=test yarn dev
# then open cypress console
# you may change the base URL if you are running it on a different location
CYPRESS_BASE_URL="http://localhost:3000" yarn cypress:open
# or directory run cypress tests
CYPRESS_BASE_URL="http://localhost:3000" yarn cypress:run
```

Unit testing and functional testings are automatically run on CI/CD pipelines.

# Starter-Kit

The goal of this project is to provide a strong and efficient starter to quickly start developments on new projects

## Features

This kit brings a diversity of features matching common needs for web applications.

### Ant Design & Styled

This project supports [Ant Design][antd] as well as [styled-components][styled].
Ant Design [LESS][less] variables can be override by definitions in `src/app/antd.override.less`

Ant Design variables are pushed into styled components theme (context) to re-used on runtime.
To do so, after doing changes on those variables, you must execute the command `yarn schema:style`.
The variables will be extracted to `src/app/antd-theme.json`.

However any changes on this override file will not trigger a rebuild,
it's required to manually restart the build/server to apply your changes.

[antd]: https://ant.design/
[less]: http://lesscss.org/
[styled]: https://styled-components.com/

### Internationalization

Internationalization is made with the help of [i18next] and [react-i18next].

Translations are stored in `./public/locales/{{language}}/{{namespace}}.json` files.
A custom handling of translations has been made for translations from the API scope.
To do so you may call `getTranslations` from the GraphQL context to asynchronously retrieve the `i18next` instance.

[i18next]: https://www.i18next.com/
[react-i18next]: https://react.i18next.com/

### Email templating

Email templating is based on [mjml] framework to generate the proper HTML.
The generation is not based on template files but on react component using server side rendering feature to get
mjml code out which is then piped to mjml to retrieve the final html.

[mjml-react] is used to provide react components matching mjml tags.

[mjml-react]: https://github.com/wix-incubator/mjml-react
[mjml]: https://mjml.io/

### Asynchronous workers

Asynchronous workers based on [BullJS][bull] is fully interfaced in the application with Redis as a broker.

Messages (job data/arguments) send to the worker will be serialized first to `EJSON` before being serialized back.
It means some type may persist despiste the serialization, such as `Date` and `ObjectID`.

[bull]: https://github.com/OptimalBits/bull

### GraphQL API

The whole application rely on serving/using a GraphQL API based on [Apollo server][apollo].
The API is served on `/graphql` (as well as the documentation and playground when running on development mode).

File uploads are supported based on [graphql-upload] specifications.

[apollo]: https://www.apollographql.com/docs/apollo-server/
[graphql-upload]: https://github.com/jaydenseric/graphql-upload#readme

### Data migration

A homemade interface for data migration is embedded in the project.

All migrations are created in the `./src/database/migrations` directory
Each migration file has a specific name following this pattern `ID_IDENTIFIER.ts`.
The `ID` should be incremented with every new migration added, however it's not an issue if it's not unique.
The `Identifier` must be unique, it should be imperative and explanatory on the migration purposes.

The migration file should be as the following sample

```ts
import { Db } from 'mongodb';

export default {
    identifier: '01_initialMigrationsIndexes',

    async up(db: Db): Promise<void> {
        await db.collection('migrations').createIndex({ identifier: 1 }, { unique: true });
    },
};
```

The main point of the migration is to execute the `up` method only once,
the identifier is the `key` which would be use to identify a migration.

After what you must add the newly created migration to the `migrations` list on the `index.ts` for the same directory.
The order in the list matters ; migrations will be executed in order, from the first to the last.

### Code quality controls

ESLint and Prettier are used to enforce best practices and code style.
At the same time, TypeScript is used for type-checking safety over most of the project source code.

Rules must not be disabled without a very good reasons, all warnings must be fixed as much as possible.
Ideally there should be no warning nor errors for the whole project.

Code quality controls are automatically run on CI/CD pipelines.

### Automation testing

Components, API resolvers and any other core functions may be tested individually by writing unit tests based on [Jest][jest].
The application may be fully tested by writing and running functional tests based on [Cypress][cypress].
Both unit tests and functional tests are expected to run on the test mode (which is not the same as development mode).

To run unit testing simply execute the following command line

```bash
yarn test
# or with code coverage reports
yarn test:coverage
```

To run functional testing you need first to start the server on test mode

```bash
# start the server
NODE_ENV=test yarn:dev
# then open cypress console
# you may change the base URL if you are running it on a different location
CYPRESS_BASE_URL="http://localhost:3000" yarn cypress:open
# or directory run cypress tests
CYPRESS_BASE_URL="http://localhost:3000" yarn cypress:run
```

Unit testing and functional testings are automatically run on CI/CD pipelines.

[jest]: https://jestjs.io
[cypress]: https://www.cypress.io/

## Practices

### Documentation

Any major changes or meaningful information must be documented and kept up to date.

## Commit convention

The [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) convention is used for this project.

Whenever the task is related to a **Jira** task, the scope of your task may be the Jira task ID.
Such as : `feat(afc-4242): add user list` (the scope should be lowercase).

## Pull Request convention

For this project, everything should go through a pull request to be merged on protected branches.

The rules to follow for pull requests

-   Proper title describing the changes
-   Add description or comments to feedback any useful information or context
-   Use merge by rebase for fixes or new features on `next`, use merge by commit when merging from `next` to `latest`
-   Assign reviewers to your pull request
-   Assign assignees to your pull request (most of the time probably yourself or anyone working on it)
-   Apply tags to specify what it is about
-   Apply milestones if applicable

### Branching

The `next` and `latest` branches are protected.
The `next` branch holds the next versions (ongoing development) while the `latest` holds the latest stable version (production ready).

When doing new developments you will need first to create a new branch dedicated to your changes.
After what you may create a Pull Request (PR) to request a merge of your work onto the `next` branch.
Only hot fixes may be requested for merge directly onto `latest`.

When merging changes to `next` or hot fixes to `latest` you should prefer merge by rebasing.

You may create draft pull requests on your early development, so that every developer can follow your work and provide early reviews.
Anyhow, everything must go through pull requests which requires the following to be merge on protected branches :

-   approval from at least one other developer
-   approval from the CI/CD pipelines

The CI/CD pipelines will run the following :

-   Dependency controls
-   Code quality controls
-   Typing controls
-   Build controls
-   Unit testings
-   Functional testings

When merging a feature of a fix onto protected branches, `semantic release` will trigger the releasing of a new version based on your commit messages.
It will generate changelogs and publish docker images matching the newly released version.

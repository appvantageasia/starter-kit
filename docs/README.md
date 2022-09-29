# Starter-Kit

The goal of this project is to provide a strong and efficient starter to quickly start developments on new projects.
It is developed and maintained by [Appvantage][apv] and follows the practices we believe in.
We welcome all feedback and contributions.

[apv]: https://www.appvantage.co

## The Appvantage distinction

Appvantage has spent 10 years in the Automotive industry with a variety of key companies globally.
With projects spanning across from Sales to After-Sales in the customer lifecycle, we have the knowledge
and capability to ensure quality and quick-to-market delivery.

**[Join us!][join] View our available positions.**

[join]: https://www.appvantage.co/career/

## Setup

You need first to install the project's dependencies

```bash
yarn install
```

Every service required by the project are already setup in `docker-compose.yml`.
However you need to bind your host ports for those services.

The default configuration is the following and to be placed in `docker-compose.override.yml`.

```yaml
version: '3.5'

services:
    html2pdf:
        ports:
            - 4000:3000

    mail:
        ports:
            - 1025:1025
            - 8025:8025

    mongo:
        ports:
            - 27017:27017

    redis:
        ports:
            - 6379:6379

    minio:
        ports:
            - 9000:9000
            - 9001:9001
```

Environment is already setup but may be changed at will (see the environment configuration section to know more about it).
Once you bound your ports with the docker compose override file, you may now start up the service.

```bash
docker-compose up -d
# or with the v2 client
docker compose up -d

# you may then verify services are running and ports properly bound by executing
docker ps
```

You may now start the development server by executing

```bash
yarn dev
```

By default, webpack will use in-memory caching for development.
However, if you are low in memory, you may run with file-system caching by setting up `CACHE_MODE` to `filesystem`.

```bash
# by inlining the environment configuration
CACHE_MODE=filesystem yarn dev
# or using the shortcut/alias
yarn dev:fs
```


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

## Branching

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

## Environment configuration

You may update application settings using environment files.

-   `.env`: Default.
-   `.env.local`: Local overrides. This file is loaded for all environments except test.
-   `.env.development`, `.env.test`, `.env.production`: Environment-specific settings.
-   `.env.development.local`, `.env.test.local`, `.env.production.local`: Local overrides of environment-specific settings.

Files on the left have more priority than files on the right:

-   **`yarn dev`**: `.env.development.local`, `.env.development`, `.env.local`, `.env`
-   **`yarn build`**: `.env.production.local`, `.env.production`, `.env.local`, `.env`
-   **`yarn test`**: `.env.test.local`, `.env.test`, `.env` (notice that `.env.local` is missing)

These variables will act as the defaults if the machine does not explicitly set them.

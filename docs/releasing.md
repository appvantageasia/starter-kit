# Releasing

Automation on releasing new releases (versions) is based on [semantic-release].
Some custom plugins have been developed to match the needs for this project.

[semantic-release]: https://semantic-release.gitbook.io/semantic-release/

## Sentry

The Sentry plugin (`devtools/releases/sentry.js`) will execute the following operations :

-   Create a Sentry release
-   Push the source code and build
-   Attach commits to the release
-   Finalize the release

The release will be created under the following name : `[namespace]@[version]`

-   `namespace` is a scope you manually defined to avoid conflicts with other project
-   `version` is the semantic version computed by semantic release.

Because this project requires only one sentry project, the sentry project ID will be used as namespace.

This plugin has the following settings

| Type   | Name              | Comment                                |
| ------ | ----------------- | -------------------------------------- |
| Env    | SENTRY_AUTH_TOKEN | Authorization token for the Sentry API |
| Plugin | organization      | Sentry organization name               |
| Plugin | project           | Sentry project ID                      |
| Plugin | repository        | GIT Repository name                    |

if the repository is not set up in the plugin config, it will then look for the environment variable `CIRCLE_PROJECT_REPONAME`.

**Sample :**

```js
module.exports = {
    // ....
    plugins: [
        // ...
        [
            require.resolve('./devtools/releases/sentry'),
            {
                // Sentry organization
                organization: 'appvantage',
                // sentry project ID
                project: 'starter-kit',
                // git repository
                // if not provided it will look for CIRCLE_PROJECT_REPONAME
                repository: 'appvantageasia/starter-kit',
            },
        ],
        // ...
    ],
};
```

## Docker

The docker plugin (`devtools/releases/docker.js`) will execute the following operations :

-   Build the docker images
-   Push the docker images

When building it will provide the two following build arguments

-   `VERSION` which is the version computed by semantic release
-   `SENTRY_RELEASE` which is the sentry release name (the Sentry plugin must be executed first)

It will build the image and tag it as follows :

-   Version specific tag `[imageName]:[version]`
-   Channel specific tag `[imageName]:[channel]`

It will push the version tag in the `prepare` step and push the channel tag in the `publish` step.

This plugin will not handle docker login operations, those must be done ahead of execution.

This plugin has the following settings

| Type   | Name  | Comment    |
| ------ | ----- | ---------- |
| Plugin | image | Image name |

**Sample :**

```js
module.exports = {
    // ....
    plugins: [
        // ...
        [
            require.resolve('./devtools/releases/docker'),
            {
                // name of the docker image
                image: 'repo.domain.co/starter-kit',
            },
        ],
        // ...
    ],
};
```

## CDN

The CDN plugin (`devtools/releases/cdn.js`) will execute the following operations :

-   Push the public assets to a object storage

It will push every assets (files) from the directory `/build/public/**/*` to `[version]/**/*` on the object storage.

This plugin has the following settings

| Type   | Name           | Comment                                               |
| ------ | -------------- | ----------------------------------------------------- |
| Env    | CDN_ACCESS_KEY | Access key                                            |
| Env    | CDN_SECRET_KEY | Secret key                                            |
| Plugin | bucket         | Bucket name                                           |
| Plugin | endPoint       | Object Storage end point                              |
| Plugin | port           | Object storage port (default: 443)                    |
| Plugin | useSSL         | Object Storage end point requires SSL (default: true) |
| Plugin | region         | Object storage region                                 |

**Sample :**

```js
module.exports = {
    // ....
    plugins: [
        // ...
        [
            require.resolve('./devtools/releases/cdn'),
            {
                // bucket name
                bucket: 'starter-kit',
                // endpoint
                endPoint: 's3.amazonaws.com',
                // aws region
                region: 'ap-southeast-1',
            },
        ],
        // ...
    ],
};
```

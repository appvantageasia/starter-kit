## Serve the assets over CDN

By default the server will serve the assets on the public path `/public/`.
However you may override the public path by using the environment settings.

The server only allows serving from `/public/`, but you may move the asset to a CDN instead.
the server will properly apply the public path and include the CDN hostname in the content security policy.

## Remove SSR support

To remove the isomorphic app you are simply required to update two files ;

First update the rendering function on the server side, which should be in `src/server/renderApplication.tsx`.
You should keep the document rendering, however you may remove the generation of the HTML injected into the React container.

The second file to update is the entrypoint for the web application, which should be `src/app/index.tsx`.
You simply need to replace `hydrate` by `render`.

You may also update styled component settings to disable SSR support.

## Build multiple web applications

You may add additional bundles to be built as web applications.
To do so you need to open the file `devtools/webpack/index.js` in which you should fine a webpack configuration
under the variable `appConfig`. Update the configuration as below :

```javascript
const appConfig = {
    /* config... */

    entry: {
        app: [
            /* entry points for app bundle */
        ],
        // add a new bunblde to be built
        otherApp: [
            // list entry points for this new bundle
            path.resolve(srcDirname, 'app/otherApp.tsx'),
        ],
    },

    /* config... */
};
```

After restarting your webpack (build) you should now see it bundling a second entry point for your second application.
You may add as many bundles as you require.

## Continuous Integration with AWS (ECR & S3)

The following is to setup your CI (CircleCI) to release new versions on AWS resources.

-   ECR as a registry for docker images (mandatory)
-   S3 to store assets to be later served over a CDN (optional)

Serving assets over a CDN is an optional settings ;
However releasing docker images is the key to the architecture and automation.

First you need to add the following secrets on your project settings :

-   `GH_TOKEN` : GitHub token use by `semantic-release` to publish tags and releases on GitHub
-   `AWS_REGION` : AWS Region use for the AWS profile
-   `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` : AWS Credentials for the AWS profile
-   `AWS_ECR_ACCOUNT_URL` : AWS ECR Account URL

You may get to know more about the AWS settings by looking at the [helm orb][ecr-orb] for AWS ECR.

If you also want to push the assets to a Object-Storage such as S3,
add `CDN_ACCESS_KEY` and `CDN_SECRET_KEY` to your settings.

[ecr-orb]: https://circleci.com/developer/orbs/orb/frameio/aws-ecr

Then you may update the `release` job to authenticate with AWS ECR before publishing docker images.

-   Setup remote docker engine
-   Authenticate with AWS ECR orb

```yaml
orbs:
    aws-ecr: circleci/aws-ecr@6.12.2

jobs:
    release:
        executor: node-standalone
        steps:
            - checkout
            - attach_workspace:
                  at: ~/project
            - setup_remote_docker:
                  version: 20.10.2
                  docker_layer_caching: true
            - aws-ecr/ecr-login
            - run:
                  name: semantic-release
                  command: yarn semantic-release
```

Finally update your semantic release configuration.
To deploy on Sentry you will however require `SENTRY_AUTH_TOKEN` in your secrets,

```javascript
module.exports = {
    branches: [
        '+([0-9])?(.{+([0-9]),x}).x',
        {
            name: 'latest',
            channel: false,
        },
        {
            name: 'next',
            channel: 'next',
            prerelease: 'next',
        },
    ],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        [
            require.resolve('./devtools/releases/sentry'),
            {
                organization: 'appvantage',
                // update to match your project
                project: 'my-project',
                // update to match your repository
                repository: 'appvantageasia/my-project',
            },
        ],
        [
            require.resolve('./devtools/releases/docker'),
            {
                // update to match your ECR
                image: 'ACOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/PROJECT',
            },
        ],
        [
            require.resolve('./devtools/releases/cdn'),
            {
                // update to match your bucket
                bucket: 'my-project-assets',
                endPoint: 's3.amazonaws.com',
                region: 'ap-southeast-1',
            },
        ],
        '@semantic-release/github',
    ],
};
```

## Continuous deployment on AWS resources

The following is to setup your CI (CircleCI) to deploy new versions on AWS resources.

First execute the following actions :

-   Create a proper Service Account on your Kuberenetes Cluster in the proper namespace
-   Your Application must already been released with helm
-   Create a kubectl configuration using the service account token for authentication
-   Encode the Kubernetes config to base 64 so it can be pushed as a secret in CircleCI
-   Create a context for your target (such as `my-project-staging`)
-   Limit the CircleCI context to a specific team only
    -   such as `my-project-admin` which includes lead developers to deploy on `UAT` and `production`
    -   such as `my-project` which includes all developers to deploy on `staging`
-   In your context create a secret `KUBECONFIG_STAGING` (for example) in which the value will be your kubectl configuration in base 64

You may now add the following jobs to your CircleCI configuration

```yaml
orbs:
    helm: circleci/helm@1.2.0

jobs:
    deploy:
        executor: node-standalone
        parameters:
            namespace:
                description: Namespace the release is in
                type: string
            release-name:
                description: Name of the release
                type: string
            kube-config:
                description: Name of the environment variable holding the kube config in base 64
                type: string
        steps:
            - checkout
            - helm/install-helm-client:
                  version: v3.4.0
            - run:
                  name: setup kube config
                  command: |
                      mkdir ~/.kube/
                      echo $<< parameters.kube-config >> | base64 --decode > ~/.kube/config
            - helm/upgrade-helm-chart:
                  chart: ./charts/app
                  reuse-values: true
                  namespace: << parameters.namespace >>
                  release-name: << parameters.release-name >>
                  helm-version: v3.4.0
                  values-to-override: app.image.tag=${CIRCLE_TAG:1},app.global.publicPath=https://CLOUDID.cloudfront.net/${CIRCLE_TAG:1}
                  update-repositories: false
```

If you want to rely on AWS IAM instead, you may use the following,
please refer to the orb [aws-cli] for more information on the environment variable to provide.

[aws-cli]: https://circleci.com/developer/orbs/orb/circleci/aws-cli

```yaml
obs:
    helm: circleci/helm@1.2.0
    aws-cli: circleci/aws-cli@2.0.3

jobs:
    deploy-with-iam:
        executor: node-standalone
        parameters:
            namespace:
                description: Namespace the release is in
                type: string
            release-name:
                description: Name of the release
                type: string
            cluster-name:
                description: Name of the cluster
                type: string
        steps:
            - checkout
            - helm/install-helm-client:
                  version: v3.4.0
            - aws-cli/install
            - aws-cli/setup
            - run:
                  name: setup kube config
                  environment:
                      CLUSTER_NAME: << parameters.cluster-name >>
                  command: aws eks --region $AWS_DEFAULT_REGION update-kubeconfig --name $CLUSTER_NAME
            - helm/upgrade-helm-chart:
                  chart: ./charts/app
                  reuse-values: true
                  namespace: << parameters.namespace >>
                  release-name: << parameters.release-name >>
                  helm-version: v3.4.0
                  values-to-override: app.image.tag=${CIRCLE_TAG:1},app.global.publicPath=https://CLOUDID.cloudfront.net/${CIRCLE_TAG:1}
                  update-repositories: false
```

This job is generic enough to be reused for all targets (Production, UAT, Staging etc..).
You must however properly updates `values-to-override` to match your resources & settings.

Finally you may add the deployment in the workflow.

```yaml
# first create partials
partials:
    # for staging
    next-filter: &next-filter
        tags:
            only:
                - /^v[0-9]+\.[0-9]+\.[0-9]+-next\.[0-9]+$/
        branches:
            ignore: /.*/

    # for UAT & Production
    latest-filter: &latest-filter
        tags:
            only:
                - /^v[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/
        branches:
            ignore: /.*/

workflows:
    # for production
    release-staging:
        jobs:
            - deploy:
                  name: release staging
                  namespace: my-project-staging
                  release-name: my-project-staging
                  kube-config: KUBE_CONFIG_STAGING
                  context:
                      - my-project-staging
                  filters: *next-filter

    # for UAT
    release-uat:
        jobs:
            - manual-approval:
                  type: approval
                  filters: *latest-filter
            - deploy:
                  name: release staging
                  namespace: my-project-staging
                  release-name: my-project-staging
                  kube-config: KUBE_CONFIG_UAT
                  context:
                      - my-project-uat
                  filters: *latest-filter

    # for production
    release-production:
        jobs:
            - manual-approval:
                  type: approval
                  filters: *latest-filter
            - deploy:
                  name: release staging
                  namespace: my-project-staging
                  release-name: my-project-staging
                  kube-config: KUBE_CONFIG_PRODUCTION
                  context:
                      - my-project-production
                  filters: *latest-filter
```

Carefully update the settings to match your needs.

## Kubernetes Ingress

We recommend using [ingress-nginx] for your ingress controllers.

You may also want to disable the compression on the application layer and rely on the nginx to do so.

```yaml
controller:
    config:
        use-gzip: 'true'
```

[ingress-nginx]: https://kubernetes.github.io/ingress-nginx/

## Ingress Nginx & AWS

If the application requires to get the real client IP and is behind a load balancer,
you will need to enable the proxy protocol on your ingress nginx.

However, it also requires to use NLB rather than ELB.

You may use the following values for your ingress-nginx release.

```yaml
service:
    annotations:
      service.beta.kubernetes.io/aws-load-balancer-backend-protocol: tcp
      service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: 'true'
      service.beta.kubernetes.io/aws-load-balancer-proxy-protocol: "*"
      service.beta.kubernetes.io/aws-load-balancer-type: nlb
  config:
    use-proxy-protocol: "true"
```

**notice: you may eventually have to manually enable the proxy protocol v2 on the target groups from the console or with AWS CLi**

**notice: if you are running your application in private subnets, ensure there's public subnet in your VPC for the load balancer to properly bind.
Please refer to the ELB/NLB documentation for more understanding.**

## Kubernetes Cert manager

We recommend using [cert-manager] to automated SSL management.
The following can be used as a template to create an issuer for [cert-manager]

[cert-manager]: https://cert-manager.io/docs/

```yaml
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
    name: letsencrypt
    namespace: 'my-project-namespace'
spec:
    acme:
        server: https://acme-v02.api.letsencrypt.org/directory
        preferredChain: 'ISRG Root X1'
        solvers:
            - http01:
                  ingress:
                      class: nginx
        privateKeySecretRef:
            name: 'letsencrypt'
```

Based on your needs and cluster usage, you are free to use the `ClusterIsser` or `Issuer`,
whichever is the most suitable.

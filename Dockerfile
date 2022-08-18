FROM node:18.7.0-buster-slim as base

# install libmongocrypt
# this can be removed if the projects does not target a support for CSFLE
RUN apt-get update  \
    && apt-get install --no-install-recommends -y curl gnupg ca-certificates apt-transport-https dumb-init \
    && curl -L https://www.mongodb.org/static/pgp/libmongocrypt.asc | gpg --dearmor >/etc/apt/trusted.gpg.d/libmongocrypt.gpg \
    && echo "deb https://libmongocrypt.s3.amazonaws.com/apt/debian buster/libmongocrypt/1.0 main" | tee /etc/apt/sources.list.d/libmongocrypt.list \
    && curl -L https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add - \
    && echo "deb http://repo.mongodb.com/apt/debian buster/mongodb-enterprise/5.0 main" | tee /etc/apt/sources.list.d/mongodb-enterprise.list \
    && apt-get update \
    && apt-get install -y libmongocrypt-dev mongodb-enterprise-cryptd \
    && rm -rf /var/lib/apt/lists/*

# set production environment for node
ENV NODE_ENV=production

# create app directory
WORKDIR /usr/src/app

FROM base as dependencies

# install build dependencies
RUN apt-get update && apt-get install python3 make g++ -y

# install node prune
RUN curl -sf https://gobinaries.com/tj/node-prune | sh

# copy everything we need from the builder to install dependencies
COPY --chown=node:node package.json yarn.lock .yarnrc.yml ./
COPY --chown=node:node .yarn ./.yarn

# install dependencies with frozen lockfile
# then clean with node prune
RUN yarn install \
    && node-prune \
    && yarn cache clean

FROM base

# copy dependencies
COPY --from=dependencies /usr/src/app .

# copy everything else
COPY --chown=node:node ./public ./public
COPY --chown=node:node ./*.json ./*.js ./*.json ./*.map ./

# set the version
ARG VERSION
ENV VERSION=${VERSION:-0.0.0-development}

# set the sentry release if any
ARG SENTRY_RELEASE
ENV APP_SENTRY_RELEASE=$SENTRY_RELEASE

# set user
USER node

# start command using the next entrypoint
CMD ["dumb-init", "node", "server.js"]

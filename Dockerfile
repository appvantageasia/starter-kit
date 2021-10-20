# production image, copy all the files and run next
FROM node:16.11.1-alpine3.14

# add dumb-init
RUN apk add dumb-init

# set production environment for node
ENV NODE_ENV=production

# create app directory
WORKDIR /usr/src/app

# copy everything we need from the builder to install dependencies
COPY --chown=node:node package.json yarn.lock ./

# install dependencies with frozen lockfile
RUN yarn install --frozen-lockfile --production

# copy everything else
COPY --chown=node:node . .

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

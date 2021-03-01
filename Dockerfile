# production image, copy all the files and run next
FROM node:14-alpine

WORKDIR /opt/app

# once again set production environment for node
ENV NODE_ENV=production

# copy everything we need from the builder to install dependencies
COPY package.json yarn.lock ./

# install dependencies with frozen lockfile
RUN yarn install --frozen-lockfile

# copy everything else
COPY . .

# set the version
ARG VERSION
ENV VERSION=${VERSION:-0.0.0-development}

# start command using the next entrypoint
CMD ["node", "server.js"]

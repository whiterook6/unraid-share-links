FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app

ENV SHARE_FILES_DB=/config/shares.db
ENV SHARE_FILES_ROOT=/shares
ENV PORT=3000
ENV NODE_OPTIONS=--disable-warning=ExperimentalWarning

RUN apk add --no-cache su-exec

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /app/dist/cli.js /usr/local/bin/docker-entrypoint.sh && \
    printf '%s\n' \
      '#!/bin/sh' \
      'if [ "$(id -u)" = "0" ]; then' \
      '  exec su-exec node node /app/dist/cli.js "$@"' \
      'fi' \
      'exec node /app/dist/cli.js "$@"' \
      > /usr/local/bin/share && \
    chmod +x /usr/local/bin/share && \
    mkdir -p /config && \
    chown -R node:node /config

EXPOSE 3000
VOLUME /config
VOLUME /shares

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]

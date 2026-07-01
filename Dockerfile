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

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
RUN chmod +x /app/dist/cli.js && \
    printf '%s\n' '#!/bin/sh' 'exec node /app/dist/cli.js "$@"' > /usr/local/bin/share && \
    chmod +x /usr/local/bin/share
EXPOSE 3000
VOLUME /shares

CMD ["node", "dist/server.js"]

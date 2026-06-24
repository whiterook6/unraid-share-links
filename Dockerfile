FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-alpine

WORKDIR /app

ENV SHARE_FILES_DB=/config/shares.db
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
RUN ln -s /app/dist/cli.js /usr/local/bin/share

EXPOSE 3000

CMD ["node", "dist/server.js"]

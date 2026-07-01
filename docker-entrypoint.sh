#!/bin/sh
set -e

if [ "$(id -u)" = "0" ]; then
  mkdir -p /config
  chown -R node:node /config
  exec su-exec node "$@"
fi

exec "$@"

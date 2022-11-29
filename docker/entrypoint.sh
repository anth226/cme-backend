#!/bin/bash

if [ -z "$1" ]; then
    echo "No migration for this micro service"
else
  echo '(3) ----> Migrating databases ...'
  cd migrations && npx tsc;
  NODE_ENV=${STARTUP_ENV} yarn run migrate
fi

echo '(3) ----> Run ...'
NODE_ENV=${STARTUP_ENV} yarn run start:"${STARTUP_ENV}":"${SERVICE}"

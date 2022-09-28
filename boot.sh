#!/bin/bash

#Dev by default
if [ -z "${1}" ]; then 
    ENV='dev'
else 
    ENV=${1}
fi

echo "Booting $ENV environment"

if [ "$(uname)" == "Darwin" ]; then
    # For macos users
    DOCKER_STATUS=$(echo $(launchctl status docker | grep Active) | cut -d' ' -f2)
    if [ "$DOCKER_STATUS" = "inactive" ]; then
        launchctl start docker
    fi
else
    # For linux users
    DOCKER_STATUS=$(echo $(systemctl status docker | grep Active) | cut -d' ' -f2)
    if [ "$DOCKER_STATUS" = "inactive" ]; then
        systemctl start docker
    fi
fi

ENV=$1 docker-compose start db adminer redis 

ENV=$1 docker-compose up --build -d api ups uprod battles-manager resources-ms blockchain-ms

sudo cp config/dev.yml apps/cme-backend/config/dev.yml
sudo docker cp apps/cme-backend/config/dev.yml api:/home/node/app/dist/apps/cme-backend/config/


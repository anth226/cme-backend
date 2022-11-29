#!/bin/bash

#Dev by default
if [ -z "$1" ]; then 
    ENV_VAL='dev'
else 
    ENV_VAL=$1
fi


echo "Reseting the code and rebooting in $ENV_VAL environment"

echo "(1) -> shutting down"
./down.sh

echo "(2) -> removing the Docker code containers (not touching the DB)"
./delete-service-containers.sh

echo "(3) -> removing the dist folder to start from a clean build"
rm -rf dist

echo "(4) -> starting in $ENV_VAL env"
./boot.sh $ENV_VAL

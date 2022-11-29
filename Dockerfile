FROM node:latest as app-base

RUN apt-get update && apt-get install -y\
    procps\
    net-tools\
    --no-install-recommends

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

RUN yarn global add\
    @nestjs/cli\
    typeorm


FROM app-base as setup

COPY --from=app-base /home/node/app /home/node/app

WORKDIR /home/node/app

COPY ./docker/entrypoint.sh entrypoint.sh
COPY *.json ./
COPY ./apps ./apps
COPY ./config ./config
COPY ./libs ./libs
COPY ./migrations ./migrations

RUN yarn install --link-duplicates

FROM app-base as build

COPY --from=setup /home/node/app /home/node/app

RUN yarn run build:libs && yarn run copy:config

FROM app-base as cme-backend

COPY --from=build /home/node/app /home/node/app

WORKDIR /home/node/app

ARG SERVICE
ARG ENV

RUN yarn run build:app:$SERVICE

ENV SERVICE=$SERVICE
ENV STARTUP_ENV=$ENV

ENTRYPOINT ["bash", "entrypoint.sh"]

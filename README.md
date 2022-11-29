<p align="center">
  <a href="https://www.milkyway.games/" target="blank"><img src="https://z2p3v6v9.rocketcdn.me/wp-content/uploads/2021/05/logoSeul-1.png" width="100" alt="CME Logo" /></a>
</p>

<p align="center">
  Backend code for the <a href="https://www.milkyway.games/" target="blank">Crypto Monkey Empire</a> game.
</p>

## Table of content

- [Description](#description)
- [Requirements](#requirements)
- [Infra](#infra)
- [Init](#init)
- [Run](#run)
- [Architecture / code](#init)
- [Concept](#description)
- Redis (TODO)
- DB (TODO)
- [How to: push new code](#description)
- Testing (TODO)

## Description

This project is developped using:

- Javascript / Typescript (https://www.typescriptlang.org/docs/)
- Nodejs
- Nest (https://docs.nestjs.com/)
- Docker

## Requirements

To be able to run this project and code for it, you'll have to have installed:

- Node js / npm. The Docker container currently uses version 14, but it might evolve. I recommend using nvm (https://github.com/nvm-sh/nvm )
- An up-to-date docker system: the easiest way is to use Docker Desktop (https://www.docker.com/products/docker-desktop)

## Infra

This project's Infrastructure relys on Docker. Once you have it working, you only need to follow the Init step once, then the Run step when you want to run the project.

Note: for windows user, it will be necessary to run Docker desktop manually first (our bash scripts only support launchctl and systemctl)

### Init

Go to the project's root and run:

`$> ./init.sh`

This will help identify the container to docker without having to push it online in the Docker base.

### Run

Go to the project's root and run:

`$> ./boot.sh`

This will launch every service needed to run the project.
After that, you can see it running directly in Docker Desktop.

## Architecture

Nest js allows us to deploy a multi services architecture pretty easily (just a bit different than microservices, but the use is mainly similar).

The database uses Postgres.

### Concept

The cme-backend service is the main service, used as the Http Layer to communicate with the frontend apps.
It communicates with the Battles manager, the Units producer and the Units production scheduler using Redis events.

All the services have access to the DB

```
 _________________   ________________   ____________________________
|                 | |                | |                            |
| battles-manager | | units-producer | | units-production-scheduler |
|_________________| |________________| |____________________________|      _____________________
                                                                          |                     |
         |                 |                       |               |--->  |    DB (postgres)    |
 ____________________________________________________________________     |_____________________|
|                                                                    |
|                      cme-backend / http layer                      |
|____________________________________________________________________|

                               |
 ____________________________________________________________________
|                                                                    |
|                  front apps (iOs/Android/desktop)                  |
|____________________________________________________________________|
```

## How to: push new code

To keep track of our changes and insure a minimum code quality, we try to do pull requests instead of just pushing to the main branch.

To do that:

- Everytime you want to start coding a new feature, create a branch for this one
- Once you're done, propose a PR from this branch to the main branch
- Assign at least Florian and/or Simon, and don't hesitate to ping them on Discord so they know you just pushed a PR.
- A review will be done, some changes might be required before approval
- Once you have approval, you can merge it to the main branch (don't forget to rebase if you see any issue blocking the merge)

## How to: launch the project in the proper environement

- If it is a new project, use deploy.sh script to init the script, use "dev" "prod" argument to provide env. Default is dev
- If not, use down.sh without arg, init.sh [env], boot.sh [env]

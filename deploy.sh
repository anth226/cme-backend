#Should be executed as sudo and be downloaded apart

#Dev by default
if [ -z "$1" ]; then 
    ENV_VAL='prod'
else 
    ENV_VAL=$1
fi

echo "Deploying APP in $ENV_VAL environment"

echo "Copying prod conf"
mkdir -p /home/gitlab-ci/temp
cp /home/gitlab-ci/cme-backend/config/prod.yml /home/gitlab-ci/temp/

echo "Deleting previous repo"
rm -r /home/gitlab-ci/cme-backend
echo "Cloning Repo"
cd /home/gitlab-ci
git clone https://gitlab+deploy-token-635521:PSUbjHSvT4s9DYBkS4Pm@gitlab.com/samy.f/cme-backend.git
chown -R admin:admin cme-backend
cd cme-backend

echo "Recopying prod conf"
cp /home/gitlab-ci/temp/prod.yml /home/gitlab-ci/cme-backend/config/

echo "Making executables"
chmod u+x /home/gitlab-ci/cme-backend/init.sh
chmod u+x /home/gitlab-ci/cme-backend/boot.sh


echo "Stopping everything"
docker-compose stop

echo "Deleting previous api"
docker container rm api

echo "Deleting previous battle-manager"
docker container rm bm

echo "Deleting previous ups"
docker container rm ups

echo "Deleting previous uprod"
docker container rm uprod

echo "Deleting previous resources-ms"
docker container rm resources-ms

echo "Deleting previous blockchain-ms"
docker container rm blockchain-ms

echo "Building dockers"
./init.sh $ENV_VAL

echo "Booting dockers"
./boot.sh $ENV_VAL

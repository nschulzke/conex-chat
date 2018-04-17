#!/bin/bash

source .env
cd client
npm run build
cd ..
rsync -ahe ssh --progress ./client/dist/ $DEPLOY_SERVER:$DEPLOY_LOCATION/public
rsync -ahe ssh --progress ./server/* $DEPLOY_SERVER:$DEPLOY_LOCATION

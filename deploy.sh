#!/bin/bash

source .env

rsync -ahe ssh --progress dist/ $DEPLOY_SERVER:$DEPLOY_LOCATION/public
rsync -ahe ssh --progress {migrations,package*,server*,knexfile.js} $DEPLOY_SERVER:$DEPLOY_LOCATION

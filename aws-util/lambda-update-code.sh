#!/bin/bash

$(dirname $0)/s3-upload-lambda.sh

echo '--- Lambda update'
aws lambda update-function-code --function-name GetGame --s3-bucket wordwar-config --s3-key lambda/lambda.zip --publish --profile wordwar
aws lambda update-function-code --function-name PutPlay --s3-bucket wordwar-config --s3-key lambda/lambda.zip --publish --profile wordwar
aws lambda update-function-code --function-name Echo    --s3-bucket wordwar-config --s3-key lambda/lambda.zip --publish --profile wordwar

description=`git rev-parse --short HEAD`
aws lambda update-function-configuration --function-name GetGame --description $description --profile wordwar
aws lambda update-function-configuration --function-name PutPlay --description $description --profile wordwar
aws lambda update-function-configuration --function-name Echo    --description $description --profile wordwar

say 'Lambda deployed'

#!/bin/bash

$(dirname $0)/s3-upload-lambda.sh

echo '--- Lambda update'
aws lambda update-function-code --function-name WordWar-GetGameLambda-J5MWSRAOO5Y4 --s3-bucket wordwar-config --s3-key lambda/lambda.zip --publish --profile wordwar
aws lambda update-function-code --function-name WordWar-PutPlayLambda-2CV93YOFZ4AB --s3-bucket wordwar-config --s3-key lambda/lambda.zip --publish --profile wordwar
aws lambda update-function-code --function-name WordWar-echo                       --s3-bucket wordwar-config --s3-key lambda/lambda.zip --publish --profile wordwar

description=`git rev-parse --short HEAD`
aws lambda update-function-configuration --function-name WordWar-GetGameLambda-J5MWSRAOO5Y4 --description $description --profile wordwar
aws lambda update-function-configuration --function-name WordWar-PutPlayLambda-2CV93YOFZ4AB --description $description --profile wordwar
aws lambda update-function-configuration --function-name WordWar-echo                       --description $description --profile wordwar

say 'Lambda deployed'

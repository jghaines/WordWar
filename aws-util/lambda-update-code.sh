#!/bin/bash

$(dirname $0)/s3-upload-lambda.sh

echo '--- Lambda update'
aws lambda update-function-code --function-name WordWar-GetGameLambda-J5MWSRAOO5Y4 --s3-bucket wordwar-config --s3-key lambda/lambda.zip  --profile wordwar
aws lambda update-function-code --function-name WordWar-PutPlayLambda-2CV93YOFZ4AB --s3-bucket wordwar-config --s3-key lambda/lambda.zip  --profile wordwar
aws lambda update-function-code --function-name echo --s3-bucket wordwar-config --s3-key lambda/lambda.zip  --profile wordwar

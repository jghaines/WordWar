#!/bin/sh

mkdir tmp
rm -f ./tmp/lambda.zip
zip ./tmp/lambda.zip ./package.json ./*.js
aws s3 cp ./tmp/lambda.zip s3://wordwar-config/lambda/lambda.zip

aws lambda update-function-code --function-name WordWar-GetGameLambda-J5MWSRAOO5Y4 --s3-bucket wordwar-config --s3-key lambda/lambda.zip
aws lambda update-function-code --function-name WordWar-PutPlayLambda-2CV93YOFZ4AB --s3-bucket wordwar-config --s3-key lambda/lambda.zip

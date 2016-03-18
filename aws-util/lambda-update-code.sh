#!/bin/sh

echo '--- Zip'
mkdir tmp
rm -f ./tmp/lambda.zip
cd lambda/
zip ../tmp/lambda.zip -r *
cd ..
echo '--- S3 copy'
aws s3 cp ./tmp/lambda.zip s3://wordwar-config/lambda/lambda.zip  --profile wordwar

echo '--- Lambda update'
aws lambda update-function-code --function-name WordWar-GetGameLambda-J5MWSRAOO5Y4 --s3-bucket wordwar-config --s3-key lambda/lambda.zip  --profile wordwar
aws lambda update-function-code --function-name WordWar-PutPlayLambda-2CV93YOFZ4AB --s3-bucket wordwar-config --s3-key lambda/lambda.zip  --profile wordwar

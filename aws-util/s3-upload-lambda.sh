#!/bin/bash

cd $(dirname $0)/../lambda/

echo '--- Zip'
mkdir -p ../tmp/
rm -f ../tmp/lambda.zip

zip ../tmp/lambda.zip -r * -x "*node_modules/aws-sdk/*" -x "*node_modules/lambda-local/*"

echo '--- S3 copy'
aws s3 cp ../tmp/lambda.zip s3://wordwar-config/lambda/lambda.zip  --profile wordwar

#!/bin/sh

rm -f node.zip
zip node.zip ./package.json ./*.js
aws s3 cp node.zip s3://wordwar-config/lambda/lambda.zip

#!/bin/sh

clear
aws s3 cp cloudformation.json s3://wordwar-config/cloudformation/cloudformation.json && \
\
aws cloudformation update-stack \
  --region us-west-2 \
  --template-url https://s3-us-west-2.amazonaws.com/wordwar-config/cloudformation/cloudformation.json \
  --stack-name WordWar \
   --profile wordwar
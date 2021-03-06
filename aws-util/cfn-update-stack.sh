#!/bin/sh

aws s3 cp ./cloudformation/cloudformation.json s3://wordwar-config/cloudformation/cloudformation.json && \
\
aws cloudformation  update-stack \
  --region          us-west-2 \
  --template-url    https://s3-us-west-2.amazonaws.com/wordwar-config/cloudformation/cloudformation.json \
  --stack-name      WordWar-dev \
  --profile         wordwar \
  --parameters      ParameterKey=Env,ParameterValue=dev \
  --capabilities    CAPABILITY_IAM # https://forums.aws.amazon.com/message.jspa?messageID=592982
  
  date
  
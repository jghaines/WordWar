#!/bin/sh

aws sqs purge-queue --queue-url https://sqs.us-west-2.amazonaws.com/458298098107/PendingGames  --profile wordwar

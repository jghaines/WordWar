#!/bin/sh

aws s3 sync ./client/ s3://wordwar-web-client/ --profile wordwar

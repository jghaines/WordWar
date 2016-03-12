#!/bin/sh

mkdir tmp
rm -f ./tmp/node.zip
zip -r ./tmp/node.zip ./*.json ./*.js # client/

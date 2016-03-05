#!/bin/sh

mkdir tmp
rm -f ./tmp/node.zip
zip -r ./tmp/node.zip ./package.json ./*.js client/

#!/usr/bin/env node
/* global Buffer */

var log = require('loglevel');
log.setLevel( log.levels.DEBUG );

var AWS = require('aws-sdk');
AWS.config.apiVersions = {
    dynamodb: '2012-08-10',
    lambda: '2015-03-31',
    sns: '2010-03-31',
    sqs: '2012-11-05'
};
AWS.config.update({region: 'us-west-2'});
var sns = new AWS.SNS();


function run() {
var params = {
  Message: JSON.stringify( { x : 1, y : 2 }  ), /* required */
  TargetArn: 'arn:aws:sns:us-west-2:458298098107:GameEvent'
};
sns.publish(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
}

run();

#!/usr/bin/env node

var log = require('loglevel');
log.setLevel( log.levels.DEBUG );

var AWS = require('aws-sdk');
AWS.config.apiVersions = {
    dynamodb: '2012-08-10'
};
AWS.config.update({region: 'us-west-2'});

var dynamo = new AWS.DynamoDB.DocumentClient();


function run() {
    var updateParams = {
        TableName: "Game",
        Key: { GameId : 'gameId-101' },
        UpdateExpression : "SET #Players = list_append( #Players, :newPlayerList )",
        ConditionExpression : "NOT contains( #Players, :newPlayer )",
        ExpressionAttributeNames : {
            "#Players" : "Players"
        },
        ExpressionAttributeValues : {
            ":newPlayer" : "player-1",
            ":newPlayerList" : [ "player-1" ]
        },
        /*AttributeUpdates : {
            "Players" : {
                Action : "ADD",
                Value : [ { playerId : "player-0" } ]
            }         
        },*/
        ReturnValues: "ALL_NEW"
    };
    
    dynamo.update(updateParams, function( err, data ) {
        if ( null !== err ) {
            console.log( err );
            return;
        } 
        console.log( data );
    });
}

run();

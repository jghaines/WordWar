#!/usr/bin/env node

var log = require('loglevel');
log.setLevel( log.levels.DEBUG );

var AWS = require('aws-sdk');
AWS.config.apiVersions = {
    dynamodb: '2012-08-10'
};
AWS.config.update({region: 'us-west-2'});

var dynamo = new AWS.DynamoDB.DocumentClient();

var createTurnInfo = function( turnIndex, letterCount ) {
        return {
            turnIndex : this.turnIndex,
            tiles : this.tiles
        }
} 


function create() {
    var remoteData = {
        gameId      : "gameId-dynamo-client-js-0000-00001",
        playerList  : [ "playerId-dynamo-client-js-0000-00000" ],
        playerCount  : 2,
        board       : "/boards/2.html",
        letterCount : 10,
        startScore  : 0,
        turnInfo    : []        
    };
    
    for (var turnIndex = 0; turnIndex < 10; turnIndex++) {
        remoteData.turnInfo.push( createTurnInfo( turnIndex, 'ABCDE' ) ); //   
//        remoteData.turnInfo.push( new TurnInfo( turnIndex, 'ABCDE' ) ); // ommitted  
//        remoteData.turnInfo.push( new TurnInfo( turnIndex, 'ABCDE' ).toJSON()); // works 
//        remoteData.turnInfo.push( { turnIndex : turnIndex, tiles : 'ABC' }); // works 
    }
    
    var putParams = {
        TableName   : "Game",
        Item        : remoteData
    };
    dynamo.put(putParams, function( err, data ) {
        if ( null !== err ) {
            console.log( err );
            return;
        } 
        console.log( data );
    });
}

function update() {
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

create();
//update();

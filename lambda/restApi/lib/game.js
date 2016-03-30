
var log = require('loglevel');
log.setLevel( log.levels.INFO );

var ENV = require('./lambda-config.json');

var vowelCountChecker = require('./wordy-letters').vowelCountChecker;
var letterGenerator = require('./wordy-letters').letterGenerator;
var UUID = require('node-uuid');
var iz = require('iz');
require('./iz-uuid')(iz);

var AWS = require('aws-sdk');
AWS.config.apiVersions = {
    dynamodb: '2012-08-10',
    lambda: '2015-03-31',
    sns: '2010-03-31',
    sqs: '2012-11-05'
};
AWS.config.update( { region: ENV.region } );

// http://stackoverflow.com/a/35251621/358224
var https = require('https');
var dynamodb = new AWS.DynamoDB( {
    httpOptions: {
        agent: new https.Agent( {
            ciphers: 'ALL',
            secureProtocol: 'TLSv1_method'
        })
    }
});

var dynamo = new AWS.DynamoDB.DocumentClient( { service: dynamodb });
var sqs = new AWS.SQS();
var sns = new AWS.SNS();

var createTurnInfo = function( turnIndex, letterCount ) {
    return {
        turnIndex : turnIndex,
        tiles : letterGenerator( letterCount, function(letters) {
            return vowelCountChecker( letters, ENV.MIN_VOWELS, ENV.MAX_VOWELS );
        })
    }
};

// AWS LAMBDA function
// @gameInfo - partial Game object defining gameInfo.playerList[0].playerId guid
//  and (optionally, for dev), gameInfo.board
// @callback - lambda callback
var getGame = function( gameInfo, callback ) {    
    log.info('getGame()');
    iz.anArray( gameInfo.playerList );
    var playerId = gameInfo.playerList[0].playerId;
    iz.uuid( playerId );

    var receiveParams = {
        QueueUrl : ENV.sqsUrl,
        VisibilityTimeout : 30 // seconds
    };
    sqs.receiveMessage( receiveParams, function( err, sqsData ) {
        getPendingGame( err, gameInfo, sqsData, callback );
    });
}

// see if there is a game on the queue, otherwise create one
var getPendingGame = function( err, gameInfo, sqsData, callback ) {
    log.info('getPendingGame()');
    if ( err !== null) {
        callback( err, null );
    }
    if ( sqsData.Messages !== undefined && sqsData.Messages.length == 1 ) { // found a game on the queue
        var sqsHandle = sqsData.Messages[0].ReceiptHandle;
        var body = JSON.parse( sqsData.Messages[0].Body );
        gameInfo.gameId = body.gameId;

        addPlayerToExistingGame( gameInfo, sqsHandle, callback );
    } else if ( sqsData.Messages === undefined ) { // no game found, request one
        createNewGame( gameInfo, callback );
    } else {
        callback( "getPendingGame() - unexpected SQS data' structure: " + JSON.stringify( sqsData ), null );
    }
}

var addPlayerToExistingGame = function( gameInfo, sqsHandle, callback ) {
    // register player for game
    var updateParams = {
        TableName           : ENV.TableName.Game,
        Key                 : { gameId : gameInfo.gameId },
        UpdateExpression    : "SET #playerList = list_append( #playerList, :newPlayerList )",
        ConditionExpression : "NOT contains( #playerList, :newPlayer )",
        ExpressionAttributeNames : {
            "#playerList" : "playerList"
        },
        ExpressionAttributeValues : {
            ":newPlayer" : gameInfo.playerList[0],
            ":newPlayerList" : gameInfo.playerList
        },
        ReturnValues        : "ALL_NEW"
    };

    dynamo.update(updateParams, function( err, dbData ) {
        playerAddedToGameDb( err, gameInfo, dbData, sqsHandle, callback )
    });
}

// player has been added to game from queue
var playerAddedToGameDb = function( err, gameInfo, dbData, sqsHandle, callback ) {
    log.info('playerAddedToGameDb()');

    if ( null !== err ) {
        if ( err.code === "ConditionalCheckFailedException" ) {
            // we have found a game we are already a player in, create a new one instead
            createNewGame( gameInfo, callback )
        } else {
            callback( err, null );
        }
    } else { // added successfully    
        var remoteData =  dbData.Attributes;

        var deleteParams = {
            QueueUrl : ENV.sqsUrl, 
            ReceiptHandle: sqsHandle
        };
        sqs.deleteMessage( deleteParams, function( err, sqsData ) {
            pendingGameDeletedFromQueue( err, remoteData, sqsData, callback );
        });
    }
}

var pendingGameDeletedFromQueue = function( err, remoteData, sqsData, callback ) {
    log.info('pendingGameDeletedFromQueue()');
    if ( null !== err ) {
        callback( err, null );
    }

    if ( remoteData.playerList.length > remoteData.playerCount ) { // shouldn't happen
        log.error( 'pendingGameDeletedFromQueue() - overfilled game ' + remoteData.GameId );
        callback( "Overfilled game " + JSON.stringify( remoteData ), null );
    } else if ( remoteData.playerList.length == remoteData.playerCount ) { // we have filled the game
        var snsParams = {
            Message: JSON.stringify( remoteData ),
            TargetArn: ENV.snsArn
        };
        sns.publish( snsParams, function( err, snsData ) {
            if ( err !== null ) {
                log.error( "SNS Publish error: ", err );
                // fall through; SNS error is not fatal
            }
            returnGameInfo( remoteData, callback );
        });
    }
};

var returnGameInfo = function( remoteData, callback ) {
    log.info('returnGameInfo()');
    callback( null, remoteData );
};

var createNewGame = function( gameInfo, callback ) {
    log.info('createNewGame(..)');
    var board =  gameInfo.board || ENV.defaultBoard || "/boards/4.html";
    var remoteData = {
        gameId          : UUID(),
        playerList      : gameInfo.playerList,
        playerCount     : 2,
        board           : board,
        letterCount     : 10,
        startGameScore  : 100,
        turnInfo        : []        
    };
    
    for (var turnIndex = 0; turnIndex < ENV.TILE_PLAY_BLOCK; turnIndex++) {
        remoteData.turnInfo.push( createTurnInfo( turnIndex, remoteData.letterCount )); 
    }
    
    var putParams = {
        TableName   : ENV.TableName.Game,
        Item        : remoteData
    };
    dynamo.put(putParams, function( err, dbData ) {
        gameAddedToDb( err, remoteData, dbData, callback )
    });
}

var gameAddedToDb = function( err, remoteData, dbData, callback ) {
    log.info('gameAddedToDb()');
    if ( null !== err ) {
        callback( err, null );
    } 
    
    // advertise pending game on Queue
    var sendParams = {
        QueueUrl : ENV.sqsUrl,
        MessageBody : JSON.stringify( remoteData )
    };
    sqs.sendMessage( sendParams, function( err, sqsData ) {
        gameSentToQueue( err, remoteData, sqsData, callback );
    });
}

var gameSentToQueue = function( err, remoteData, sqsData, callback ) {
    log.info('gameSentToQueue()');
    if ( null !== err ) {
        callback( err, null );
    }
    remoteData.queueMessageId = sqsData.MessageId;
    callback( null, remoteData );
}

module.exports = {
    getGame             : getGame,
}

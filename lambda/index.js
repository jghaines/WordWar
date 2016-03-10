
var log = require('loglevel');
log.setLevel( log.levels.INFO );
log.info('Running lambda.js');

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

var getKey = function( gameId, turnIndex ) {
    return 'game-' + gameId + '-turn-' + turnIndex;
};

var TILE_PLAY_BLOCK = 10; // generate a new set of TILE_PLAY_BLOCK tiles every TILE_PLAY_BLOCK moves
// parameters for generating sets of tiles
var MIN_VOWELS = 2; 
var MAX_VOWELS = 6; 


var createTurnInfo = function( turnIndex, letterCount ) {
    return {
        turnIndex : turnIndex,
        tiles : letterGenerator( letterCount, function(letters) {
            return vowelCountChecker( letters, MIN_VOWELS, MAX_VOWELS );
        })
    }
};

// AWS LAMBDA function
// playerInfo.PlayerId:   'guid id of player'
// context - lambda
var getGame = function( params, context ) {    
    log.info('getGame()');    
    var playerId = params.playerId;
    iz.uuid( playerId );

    var receiveParams = {
        QueueUrl : ENV.sqsUrl,
        VisibilityTimeout : 30 // seconds
    };
    sqs.receiveMessage( receiveParams, function( err, sqsData ) {
        getPendingGame( err, params, sqsData, context );
    });
}

// see if there is a game on the queue, otherwise create one
var getPendingGame = function( err, playerId, sqsData, context ) {
    log.info('getPendingGame()');
    if ( err !== null) {
        context.fail( err );
    }
    if ( sqsData.Messages !== undefined && sqsData.Messages.length == 1 ) { // found a game on the queue
        var sqsHandle = sqsData.Messages[0].ReceiptHandle;
        var body = JSON.parse( sqsData.Messages[0].Body );
        var gameId = body.gameId;

        // register player for game
        var updateParams = {
            TableName           : ENV.GameTableName,
            Key                 : { gameId : gameId },
            UpdateExpression    : "SET #playerList = list_append( #playerList, :newPlayerList )",
            ConditionExpression : "NOT contains( #playerList, :newPlayer )",
            ExpressionAttributeNames : {
                "#playerList" : "playerList"
            },
            ExpressionAttributeValues : {
                ":newPlayer" : playerId,
                ":newPlayerList" : [ playerId ]
            },
            ReturnValues        : "ALL_NEW"
        };

        dynamo.update(updateParams, function( err, dbData ) {
            playerAddedToGameDb( err, playerId, dbData, sqsHandle, context )
        });

    } else if ( sqsData.Messages === undefined ) { // no game found, request one
        createNewGame( playerId, context );
    } else {
        context.fail( "getPendingGame() - unexpected SQS data' structure: " + JSON.stringify( sqsData ));
    }
}

// player has been added to game from queue
var playerAddedToGameDb = function( err, playerId, dbData, sqsHandle, context ) {
    log.info('playerAddedToGameDb()');

    if ( null !== err ) {
        if ( err.code === "ConditionalCheckFailedException" ) {
            // we have found a game we are already a player in, create a new one instead
            createNewGame( playerId, context )
        } else {
            context.fail( err );
        }
    } else { // added successfully    
        var remoteData =  dbData.Attributes;

        var deleteParams = {
            QueueUrl : ENV.sqsUrl, 
            ReceiptHandle: sqsHandle
        };
        sqs.deleteMessage( deleteParams, function( err, sqsData ) {
            pendingGameDeletedFromQueue( err, remoteData, sqsData, context );
        });
    }
}

var pendingGameDeletedFromQueue = function( err, remoteData, sqsData, context ) {
    log.info('pendingGameDeletedFromQueue()');
    if ( null !== err ) {
        context.fail( err );
    }

    if ( remoteData.playerList.length > remoteData.playerCount ) { // shouldn't happen
        log.error( 'pendingGameDeletedFromQueue() - overfilled game ' + remoteData.GameId );
        context.fail( "Overfilled game " + JSON.stringify( remoteData ));
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
            returnGameInfo( remoteData, context );
        });
    }
};

var returnGameInfo = function( remoteData, context ) {
    log.info('returnGameInfo()');
    context.succeed( remoteData );
};

var createNewGame = function( playerId, context ) {
    log.info('createNewGame()');
    var remoteData = {
        gameId      : UUID(),
        playerList  : [ playerId ],
        playerCount : 2,
        board       : "/boards/2.html",
        letterCount : 10,
        startScore  : 0,
        turnInfo    : []        
    };
    
    for (var turnIndex = 0; turnIndex < TILE_PLAY_BLOCK; turnIndex++) {
        // DynamoDB won't serialise
        remoteData.turnInfo.push( createTurnInfo( turnIndex, remoteData.letterCount )); 
    }
    
    var putParams = {
        TableName   : ENV.GameTableName,
        Item        : remoteData
    };
    dynamo.put(putParams, function( err, dbData ) {
        gameAddedToDb( err, remoteData, dbData, context )
    });
}

var gameAddedToDb = function( err, remoteData, dbData, context) {
    log.info('gameAddedToDb()');
    if ( null !== err ) {
        context.fail( err );
    } 
    
    // advertise pending game on Queue
    var sendParams = {
        QueueUrl : ENV.sqsUrl,
        MessageBody : JSON.stringify( remoteData )
    };
    sqs.sendMessage( sendParams, function( err, sqsData ) {
        gameSentToQueue( err, remoteData, sqsData, context );
    });
}

var gameSentToQueue = function( err, remoteData, sqsData, context ) {
    log.info('gameSentToQueue()');
    if ( null !== err ) {
        context.fail( err );
    }
    remoteData.queueMessageId = sqsData.MessageId;
    context.succeed( remoteData );
}


// AWS LAMBDA function
// playParams.gameId      requried - guid id of game
// playParams.turnIndex   requried - integer index of turn in game
// playParams.playerIndex requried - integer index of player in game
// playParams.*           optional - other play data
var putPlay = function( playParams, context) {
    log.info('putPlay()');
    iz.uuid( playParams.gameId );
    iz.int( playParams.turnIndex );
    iz.int( playParams.playerIndex );

    var playerIndex = parseInt( playParams.playerIndex );

    var putParams = {
        TableName   : ENV.PlayTableName,
        Item :  {
            gameId_turnIndex    : getKey( playParams.gameId, playParams.turnIndex ),
            playerIndex         : playerIndex,
            play                : playParams
        }
    };
    
    dynamo.put( putParams, function( err, dbData ) {
        if ( null !== err ) {
            context.fail( err );
        }
        var turnParams =  { 
            gameId:     playParams.gameId,
            turnIndex:  playParams.turnIndex,
            snsPublish: true // flag to SNS publish if turn complete
        };
        getPlaysForTurn( turnParams, context );
    });
};

// AWS LAMBDA function
// turnParams.gameId:     'guid id of game'
// turnParams.turnIndex:  <0-based integer index of turn>,
// turnParmas.snsPublish: optional boolean - whether to fire SNS event if turn is complete 
// context - lambda
var getPlaysForTurn = function( turnParams, context ) {
    log.info('getPlaysForTurn()');
    iz.uuid( turnParams.gameId );
    iz.int( turnParams.turnIndex );

    var queryParams = {
        TableName               : ENV.PlayTableName,
        KeyConditionExpression  : "gameId_turnIndex = :v_Id",
        ExpressionAttributeValues : {
            ":v_Id" : getKey( turnParams.gameId, turnParams.turnIndex )
        }
    };
    
    dynamo.query(queryParams, function( err, dbData ) {
        gotPlaysForTurnFromDb( err, turnParams, dbData, context );
    });
};

var gotPlaysForTurnFromDb = function( err, turnParams, dbData, context ) {
    log.info('gotPlaysForTurnFromDb()');
    if ( null !== err ) {
        context.fail( err );
    } 
        
    if ( dbData === null || dbData.Items === null || dbData.Items.length <= 0 ) {
        context.fail( {
            message: "Expected at least one Play in turn",
            turnInfo: turnParams
        });
    } else { 
        var plays = [];
        dbData.Items.forEach( function( item ) {
           plays.push( item.play ); 
        });
        
        var remoteData = {
            gameId      : plays[0].gameId,
            playList    : plays,
            turnList : [
                {
                    turnIndex : 0,
                    tiles : 'DOGDICIMTP'
                },
                {
                    turnIndex : 1,
                    tiles : 'CATDICIMTP'
                },
                {
                    turnIndex : 2,
                    tiles : 'BEANICIMTP'
                }   
            ]
        };
        
       if ( typeof turnParams.snsPublish === "boolean" && turnParams.snsPublish && // if this is flagged for SNS 
            plays.length == 2 ) { // and turn complete
                var snsParams = {
                    Message: JSON.stringify( remoteData ),
                    TargetArn: ENV.snsArn
                };
                sns.publish( snsParams, function( err, snsData ) {
                    if ( err !== null ) {
                        log.error( "SNS Publish error: ", err );
                        // fall through; SNS error is not fatal
                    }
                    returnRemoteData( remoteData, context );
                });
        } else { // no SNS, just return
            returnRemoteData( remoteData, context );            
        }
    }
};

var returnRemoteData = function( remoteData, context ) {
    log.info( 'returnRemoteData()' );
    context.succeed( remoteData );
};

module.exports = {
    getGame             : getGame,
    putPlay             : putPlay,
    getPlaysForTurn     : getPlaysForTurn
}

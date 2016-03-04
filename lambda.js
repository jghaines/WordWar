
var log = require('loglevel');
log.setLevel( log.levels.INFO );
log.info('Running lambda.js');

var UUID = require('node-uuid');


var AWS = require('aws-sdk');
AWS.config.apiVersions = {
    dynamodb: '2012-08-10',
    lambda: '2015-03-31',
    sns: '2010-03-31',
    sqs: '2012-11-05'
};
AWS.config.update({region: 'us-west-2'});

// http://stackoverflow.com/a/35251621/358224
var https = require('https');
var dynamodb = new AWS.DynamoDB({
    httpOptions: {
        agent: new https.Agent({
            ciphers: 'ALL',
            secureProtocol: 'TLSv1_method'
        })
    }
});

var dynamo = new AWS.DynamoDB.DocumentClient( { service: dynamodb });
var sqs = new AWS.SQS();
var sns = new AWS.SNS();

var queueUrl = "https://sqs.us-west-2.amazonaws.com/458298098107/PendingGames";
var snsArn = "arn:aws:sns:us-west-2:458298098107:GameEvent";


var getKey = function( gameId, turnIndex ) {
    return 'game-' + gameId + '-turn-' + turnIndex;
};

// AWS LAMBDA function
// playerInfo.PlayerId:   'guid id of player'
// context - lambda
var getGame = function(playerInfo, context) {
    log.info('getGame()');
    if ( playerInfo.PlayerId === undefined ) {
        context.fail( "Missing required key 'PlayerId' in getGame() params" );
        return;
    }
    var receiveParams = {
        QueueUrl : queueUrl,
        VisibilityTimeout : 30 // seconds
    };
    sqs.receiveMessage( receiveParams, function( err, data ) {
        getPendingGame( err, playerInfo, data, context );
    });
}

// see if there is a game on the queue, otherwise create one
var getPendingGame = function( err, playerInfo, data, context ) {
    log.info('getPendingGame()');
    var playerId = playerInfo.PlayerId;
    if ( err !== null) {
        context.fail( err );
        return;
    }
    if ( data.Messages !== undefined && data.Messages.length == 1 ) { // found a game on the queue
        var sqsHandle = data.Messages[0].ReceiptHandle;
        var body = JSON.parse( data.Messages[0].Body );
        var gameId = body.GameId;

        // register player for game
        var updateParams = {
            TableName: "Game",
            Key: { GameId : gameId },
            UpdateExpression : "SET #Players = list_append( #Players, :newPlayerList )",
            ConditionExpression : "NOT contains( #Players, :newPlayer )",
            ExpressionAttributeNames : {
                "#Players" : "Players"
            },
            ExpressionAttributeValues : {
                ":newPlayer" : playerId,
                ":newPlayerList" : [ playerId ]
            },
            ReturnValues: "ALL_NEW"
        };

        dynamo.update(updateParams, function( err, dbData ) {
            var gameInfo = {  GameId : gameId, PlayerId : playerId };
            playerAddedToGameDb( err, gameInfo, dbData, sqsHandle, context )
        });

    } else if ( data.Messages === undefined ) { // no game found, request one
        createNewGame( playerId, context );
    } else {
        context.fail( "getPendingGame() - unexpected SQS data' structure: " + JSON.stringify( data ));
    }
}

// player has been added to game from queue
var playerAddedToGameDb = function( err, gameInfo, dbData, sqsHandle, context ) {
    log.info('playerAddedToGameDb()');

    if ( null !== err ) {
        if ( err.code === "ConditionalCheckFailedException" ) {
            // we have found a game we are already a player in, create a new one instead
            createNewGame( gameInfo.PlayerId, context )
        } else {
            context.fail( err );
        }
        return;
    } 
    
    var deleteParams = {
        QueueUrl : queueUrl, 
        ReceiptHandle: sqsHandle
    };
    sqs.deleteMessage( deleteParams, function( err, sqsData ) {
        pendingGameDeletedFromQueue( err, gameInfo, sqsData, context );
    });
}

var pendingGameDeletedFromQueue = function( err, gameInfo, sqsData, context ) {
    log.info('pendingGameDeletedFromQueue()');
    if ( null !== err ) {
        context.fail( err );
        return;
    } 
    context.succeed( gameInfo );
}

var createNewGame = function( playerId, context ) {
        var game = {
            GameId : UUID(),
            MaxPlayers : 2,
            Players : [ playerId ],
            Tiles : [ 'AETANOISRL' ]
        };
        var putParams = {
            TableName: "Game",
            Item :  game
        };
        dynamo.put(putParams, function( err, dbData ) {
            gameAddedToDb( err, game, dbData, context )
        });
}

var gameAddedToDb = function( err, gameInfo, dbData, context) {
    log.info('gameAddedToDb()');
    if ( null !== err ) {
        context.fail( err );
        return;
    } 
    
    // advertise pending game on Queue
    var sendParams = {
        QueueUrl : queueUrl,
        MessageBody : JSON.stringify( gameInfo )
    };
    sqs.sendMessage( sendParams, function( err, sqsData ) {
        gameSentToQueue( err, gameInfo, sqsData, context );
    });
}

var gameSentToQueue = function( err, gameInfo, sqsData, context ) {
    log.info('gameSentToQueue()');
    if ( null !== err ) {
        context.fail( err );
        return;
    } 
    var gameInfo = {
        GameId : gameInfo.GameId,
        QueueMessageId : sqsData.MessageId, 
    }
    context.succeed( gameInfo );
}


// AWS LAMBDA function
// playParams.gameId      requried - guid id of game
// playParams.turnIndex   requried - integer index of turn in game
// playParams.playerIndex requried - integer index of player in game
// playParams.*           optional - other play data
var putMove = function( playParams, context) {
    log.info('putMove()');
    var playerIndex = parseInt( playParams.playerIndex );

    var putParams = {
        TableName: "Play",
        Item :  {
            GameId_TurnIndex    : getKey( playParams.gameId, playParams.turnIndex ),
            PlayerIndex         : playerIndex,
            Play                : playParams
        }
    };
    
    dynamo.put( putParams, function( err, dbData ) {
        if ( null !== err ) {
            context.fail( err );
            return;
        } 
        getMovesForTurn( { 
            gameId: play.gameId,
            turnIndex: play.turnIndex,
            snsPublish : true // flag to SNS publish if turn complete
        }, context );
    });
};

// AWS LAMBDA function
// turnParams.gameId:     'guid id of game'
// turnParams.turnIndex:  <0-based integer index of turn>,
// turnParmas.snsPublish: optional boolean - whether to fire SNS event if turn for move is complete 
// context - lambda
var getMovesForTurn = function( turnParams, context ) {
    log.info('getMovesForTurn()');
    var queryParams = {
        "TableName": "Play",
        "KeyConditionExpression" : "GameId_TurnIndex = :v_Id",
        "ExpressionAttributeValues" : {
            ":v_Id" : getKey( turnParams.gameId, turnParams.turnIndex )
        }
    };
    
    dynamo.query(queryParams, function( err, dbData ) {
        gotMovesForTurnFromDb( err, turnParams, dbData, context );
    });
};

var gotMovesForTurnFromDb = function( err, turnInfo, dbData, context ) {
    log.info('gotMovesForTurnFromDb()');
    if ( null !== err ) {
        context.fail( err );
        return;
    } 
        
    if ( dbData === null || dbData.Items === null || dbData.Items.length <= 0 ) {
        context.fail( {
            message: "Expected at least one move in turn",
            turnInfo: turnInfo
        });
    } else { 
        var moves = [];
        dbData.Items.forEach( function( item ) {
           moves.push( item.Play ); 
        });
        
        var moveInfo = {
            gameId : moves[0].gameId,
            turnIndex : moves[0].turnIndex,
            moveCount : moves.length,
            moves : moves,
            turnInfo : [
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
        
        if ( typeof turnInfo.snsPublish === "boolean" && turnInfo.snsPublish && // if this is flagged for SNS 
            moves.length == 2 ) { // and turn complete
                var snsParams = {
                    Message: JSON.stringify( moveInfo  ),
                    TargetArn: snsArn
                };
                sns.publish( snsParams, function( err, snsData ) {
                    if ( err !== null ) {
                        log.error( "SNS Publish error: ", err );
                        // fall through; SNS error is not fatal
                    }
                    returnMoves( moveInfo, context );
                });
        } else { // no SNS, just return
            returnMoves( moveInfo, context );            
        }
    }
};

var returnMoves = function( moveInfo, context ) {
    context.succeed( moveInfo );
};

module.exports = {
    getGame : getGame,
    putMove : putMove,
    getMovesForTurn : getMovesForTurn
}

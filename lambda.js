
var log = require('loglevel');
log.setLevel( log.levels.INFO );
log.info('Running lambda.js');

var UUID = require('node-uuid');


var AWS = require('aws-sdk');
AWS.config.apiVersions = {
    dynamodb: '2012-08-10',
    lambda: '2015-03-31',
    sqs: '2012-11-05'
};
AWS.config.update({region: 'us-west-2'});
var queueUrl = "https://sqs.us-west-2.amazonaws.com/458298098107/PendingGames";

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


var getKey = function( gameId, turnIndex ) {
    return 'game-' + gameId + '-turn-' + turnIndex;
};

// AWS LAMBDA function
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
        var receiptHandle = data.Messages[0].ReceiptHandle;
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

        dynamo.update(updateParams, function( err, data ) {
            playerAddedToGameDb( err, {  GameId : gameId, PlayerId : playerId }, data, receiptHandle, context )
        });

    } else if ( data.Messages === undefined ) { // no game found, request one
        createNewGame( playerId, context );
    } else {
        context.fail( "getPendingGame() - unexpected SQS data' structure: " + JSON.stringify( data ));
    }
}

// player has been added to game from queue
var playerAddedToGameDb = function( err, gameInfo, data, receiptHandle, context ) {
    log.info('playerAddedToGameDb()');

    if ( null !== err ) {
        if ( err.code === "ConditionalCheckFailedException" ) {
            // we have found a game we are already a player in, create a new one
            createNewGame( gameInfo.PlayerId, context )
        } else {
            context.fail( err );
        }
        return;
    } 
    
    var deleteParams = {
        QueueUrl : queueUrl, 
        ReceiptHandle: receiptHandle
    };
    sqs.deleteMessage( deleteParams, function( err, data ) {
        pendingGameDeletedFromQueue( err, gameInfo, data, context );
    });
}

var pendingGameDeletedFromQueue = function( err, gameInfo, data, context ) {
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
        dynamo.put(putParams, function( err, data ) {
            gameAddedToDb( err, game, data, context )
        });
}

    var gameAddedToDb = function( err, gameInfo, data, context) {
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
    context.succeed( {
        GameId : gameInfo.GameId,
        QueueMessageId : sqsData.MessageId, 
    });
}


// AWS LAMBDA function
var putMove = function(play, context) {
    log.info('putMove()');
    var playerIndex = parseInt( play.playerIndex );

    var putParams = {
        TableName: "Play",
        Item :  {
            GameId_TurnIndex    : getKey( play.gameId, play.turnIndex ),
            PlayerIndex         : playerIndex,
            Play                : play
        }
    };
    
    dynamo.put(putParams, function( err, data ) {
        if ( null !== err ) {
            context.fail( err );
            return;
        } 
        getMovesForTurn( { gameId: play.gameId, turnIndex: play.turnIndex }, context );
    });
};

// AWS LAMBDA function
var getMovesForTurn = function( turnInfo, context ) {
    log.info('getMovesForTurn()');
    var queryParams = {
        "TableName": "Play",
        "KeyConditionExpression" : "GameId_TurnIndex = :v_Id",
        "ExpressionAttributeValues" : {
            ":v_Id" : getKey( turnInfo.gameId, turnInfo.turnIndex )
        }
    };
    
    dynamo.query(queryParams, function( err, data ) {
        returnMovesForTurn( err, { gameId: turnInfo.gameId, turnIndex: turnInfo.turnIndex }, data, context );
    });
};

var returnMovesForTurn = function( err, turnInfo, data, context ) {
    log.info('returnMovesForTurn()');
    if ( null !== err ) {
        context.fail( err );
        return;
    } 
        
    if ( data === null || data.Items === null || data.Items.length <= 0 ) {
        context.fail( {
            message: "Expected at least one move in turn",
            turnInfo: turnInfo
        });
    } else { 
        var moves = [];
        data.Items.forEach( function( item ) {
           moves.push( item.Play ); 
        });
        context.succeed( {
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
        } );
    }
};

module.exports = {
    getGame : getGame,
    putMove : putMove,
    getMovesForTurn : getMovesForTurn
}
    
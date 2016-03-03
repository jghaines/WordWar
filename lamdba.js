console.log('Loading function');

//var doc = require('dynamodb-doc');
var AWS = require('aws-sdk');
var dynamo = new AWS.DynamoDB.DocumentClient( { region: "us-west-2"} );

var getKey = function( gameId, turnIndex ) {
    return 'game-' + gameId + '-turn-' + turnIndex;
};

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
}
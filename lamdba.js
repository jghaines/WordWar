console.log('Loading function');

//var doc = require('dynamodb-doc');
var AWS = require('aws-sdk');
var dynamo = new AWS.DynamoDB.DocumentClient( { 
//    endpoint :  "http://localhost:8000",
    region:     "us-west-2"     } );

var getKey = function( gameId, turnIndex ) {
    return 'game-' + gameId + '-turn-' + turnIndex;
};

var putMove = function(play, context) {
    //console.log('Received event:', JSON.stringify(event, null,'game-' +  2));
    var playerIndex = parseInt( play.playerIndex );

    var putParams = {
        TableName: "Play",
        Item :  {
            GameId_TurnIndex    : getKey( play.gameId, play.turnIndex ),
            PlayerIndex         : playerIndex,
            Play                : play
        }
    };
    
    dynamo.put(putParams, ( err, data ) => {
        getMoveCount( err, { gameId: play.gameId, turnIndex: play.turnIndex }, context );
    });
};

var getMoveCount = function( err, turnInfo, context ) {
    if ( null != err ) {
        context.fail( err );
        return;
    } 

    var queryParams = {
        "TableName": "Play",
        "KeyConditionExpression" : "GameId_TurnIndex = :v_Id",
        "ExpressionAttributeValues" : {
            ":v_Id" : getKey( turnInfo.gameId, turnInfo.turnIndex )
        }
    };
    
    dynamo.query(queryParams, ( err, data ) => {
        checkMoveCount( err, { gameId: turnInfo.gameId, turnIndex: turnInfo.turnIndex }, context, data );
    });
};

var checkMoveCount = function( err, turnInfo, context, data ) {
    if ( null != err ) {
        context.fail( err );
        return;
    } 
        
    if ( data == null || data.Items == null || data.Items.length <= 0 ) {
        context.fail( {
            message: "Expected at least one move in game",
            turnInfo: turnInfo
        });
    } else { 
        var moves = [];
        data.Items.forEach( ( item ) => {
           moves.push( item.Play ); 
        });
        context.succeed( {
            status : ( data.Items.length < 2 ? "AWAITING_MOVES" : "TURN_COMPLETE" ),
            gameId : moves[0].gameId,
            turnIndex : moves[0].turnIndex,
            moves : moves
        } );
    }
};

module.exports = {
    putMove : putMove
}

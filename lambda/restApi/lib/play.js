
var log = require('loglevel');
log.setLevel( log.levels.INFO );

var ENV = require('./lambda-config.json');

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


// AWS LAMBDA endpoint
// playParams.gameId      requried - guid id of game
// playParams.turnIndex   requried - integer index of turn in game
// playParams.playerIndex requried - integer index of player in game
// playParams.*           optional - other play data
var putPlay = function( playParams, callback) {
    log.info('putPlay()');
    iz.uuid( playParams.gameId );
    iz.int( playParams.turnIndex );
    iz.int( playParams.playerIndex );

    var playerIndex = parseInt( playParams.playerIndex );

    var putParams = {
        TableName   : ENV.TableName.Play,
        Item :  {
            gameId_turnIndex    : getKey( playParams.gameId, playParams.turnIndex ),
            playerIndex         : playerIndex,
            play                : playParams
        }
    };
    
    dynamo.put( putParams, function( err, dbData ) {
        if ( null !== err ) {
            callback( err, null );
        }
        var turnParams =  { 
            gameId:     playParams.gameId,
            turnIndex:  playParams.turnIndex,
            snsPublish: true // flag to SNS publish if turn complete
        };
        getTurn( turnParams, callback );
    });
};

// AWS LAMBDA function
// Also called indirectly by putPlay
// Get Plays for specified turn and possibly turnInfo
// @turnParams.gameId:     'guid id of game'
// @turnParams.turnIndex:  <0-based integer index of turn>,
// @turnParmas.snsPublish: optional boolean - whether to fire SNS event if turn is complete 
// @callback - lambda callback
var getTurn = function( turnParams, callback ) {
    log.info('getTurn()');
    iz.uuid( turnParams.gameId );
    iz.int( turnParams.turnIndex );

    var remoteData = {
        gameId : turnParams.gameId
    }
    if ( turnParams.turnIndex % ENV.TILE_PLAY_BLOCK === 0 ) {
        getTilesForTurn( turnParams, remoteData, callback );
    } else {
        getPlaysForTurn( turnParams, remoteData, callback );
    }
}

var getTilesForTurn = function( turnParams, remoteData, callback ) {
    log.info('getTilesForTurn()');

    getPlaysForTurn( turnParams, remoteData, callback );
}

var getPlaysForTurn = function( turnParams, remoteData, callback ) {
    var queryParams = {
        TableName               : ENV.TableName.Play,
        KeyConditionExpression  : "gameId_turnIndex = :v_Id",
        ExpressionAttributeValues : {
            ":v_Id" : getKey( turnParams.gameId, turnParams.turnIndex )
        }
    };
    
    dynamo.query(queryParams, function( err, dbData ) {
        gotPlaysForTurnFromDb( err, remoteData, turnParams, dbData, callback );
    });
};

var gotPlaysForTurnFromDb = function( err, remoteData, turnParams, dbData, callback ) {
    log.info('gotPlaysForTurnFromDb()');
    if ( null !== err ) {
        callback( err, null );
    } 
        
    if ( dbData === null || dbData.Items === null || dbData.Items.length <= 0 ) {
        callback( {
            message: "Expected at least one Play in turn",
            turnInfo: turnParams
        }, null );
    } else { 
        remoteData.playList = []; 
        dbData.Items.forEach( function( item ) {
           remoteData.playList.push( item.play ); 
        });
        
       if ( typeof turnParams.snsPublish === "boolean" && turnParams.snsPublish && // if this is flagged for SNS 
            remoteData.playList.length == 2 ) { // and turn complete // TODO: remove hard-coded player count
                var snsParams = {
                    Message: JSON.stringify( remoteData ),
                    TargetArn: ENV.snsArn
                };
                sns.publish( snsParams, function( err, snsData ) {
                    if ( err !== null ) {
                        log.error( "SNS Publish error: ", err );
                        // fall through; SNS error is not fatal
                    }
                    returnRemoteData( remoteData, callback );
                });
        } else { // no SNS, just return
            returnRemoteData( remoteData, callback );            
        }
    }
};

var returnRemoteData = function( remoteData, callback ) {
    log.info( 'returnRemoteData()' );
    callback( null, remoteData );
};

module.exports = {
    putPlay             : putPlay,
    getPlaysForTurn     : getPlaysForTurn
}


var log = require('loglevel');
log.setLevel( log.levels.INFO );

var ENV = require('./lambda-config.json');

var Promise = require("bluebird");

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
Promise.promisifyAll( Object.getPrototypeOf( dynamo ));
Promise.promisifyAll( Object.getPrototypeOf( sqs ));
Promise.promisifyAll( Object.getPrototypeOf( sns ));


var getKey = function( gameId, turnIndex ) {
    return 'game-' + gameId + '-turn-' + turnIndex;
};


// 
//  [ API Gateway ]     [ API Gateway ]
//      v                   v
//  [ Lambda ]          [ Lambda ]
//      v                   v
//      |                putPlay( play )
//      |                   |
//      |                ( dbPut )
//      +<------------------+
//      v
//  getTurn( turn)
//      |
//      v
//      +------------------>+                   if the game needs more tiles
//      |                   v
//      |               getTilesForTurn
//      |                   |
//      +<------------------+
//      v
//  getPlaysForTurn
//      |
//      v
//      +----( putPlay )--->+                   if getTurn was invoked by putPlay
//      |                   v
//      |               snsPublish
//      |                   |
//      +<------------------+
//      v
//  return playInfo


// AWS LAMBDA endpoint
// playParams.gameId      requried - guid id of game
// playParams.turnIndex   requried - integer index of turn in game
// playParams.playerIndex requried - integer index of player in game
// playParams.*           optional - other play data
var putPlay = function( event ) {
    log.info('putPlay()');
    if ( ! event )              throw new TypeError( "Expected 'event' parameter" );
    if ( ! event.principalId )  throw new TypeError( "Expected 'event.principalId' parameter" );
    if ( ! event.body )         throw new TypeError( "Expected 'event.body' parameter" );

    var playParams = event.body;
    if ( ! playParams.gameId )      throw new TypeError( "Expected 'gameId' parameter" );
    if ( ! playParams.turnIndex )   throw new TypeError( "Expected 'turnIndex' parameter" );
    if ( ! playParams.playerIndex ) throw new TypeError( "Expected 'playerIndex' parameter" );

    var playerIndex = parseInt( playParams.playerIndex );

    var putParams = {
        TableName   : ENV.TableName.Play,
        Item :  {
            gameId_turnIndex    : getKey( playParams.gameId, playParams.turnIndex ),
            playerIndex         : playerIndex,
            play                : playParams
        }
    };

    var getTurnPromise = dynamo.putAsync( putParams )     // store intermediate result - http://stackoverflow.com/a/28252015/358224
        .then( () => getTurn( playParams.gameId, playParams.turnIndex ));

    return getTurnPromise
        .then( () => snsPublish( getTurnPromise.value() ))
        .then( () => getTurnPromise.value() );
};

// AWS LAMBDA function
// Also called indirectly by putPlay
// Get Plays for specified turn and possibly turnInfo
// @param gameId:     'guid id of game'
// @param turnIndex:  <0-based integer index of turn>,
// @returns Promise
var getTurn = function( gameId, turnIndex ) {
    log.info('getTurn()');

    if ( ! gameId )      throw new TypeError( "Expected 'gameId' parameter" );
    if ( ! turnIndex )   throw new TypeError( "Expected 'turnIndex' parameter" );

    if ( turnIndex % ENV.TILE_PLAY_BLOCK === 0 ) {
        return getTilesForTurn( gameId, turnIndex );
    } else {
        return getPlaysForTurn( gameId, turnIndex );
    }
}

var getTilesForTurn = function( gameId, turnIndex ) {
    log.info('getTilesForTurn()');

    // TODO: create additional tiles

    return getPlaysForTurn( gameId, turnIndex );
}

var getPlaysForTurn = function( gameId, turnIndex ) {
    log.info('getPlaysForTurn()');
    
    var queryParams = {
        TableName               : ENV.TableName.Play,
        KeyConditionExpression  : "gameId_turnIndex = :v_Id",
        ExpressionAttributeValues : {
            ":v_Id" : getKey( gameId, turnIndex )
        }
    };
    
    return dynamo.queryAsync( queryParams )
        .then( dbData => returnPlayInfo( gameId, dbData ))
};

var returnPlayInfo = function( gameId, dbData ) {
    log.info('returnPlayInfo()');
        
    if ( ! gameId )      throw new TypeError( "Expected 'gameId' parameter" );
    if ( ! dbData || !dbData.Items || dbData.Items.length <= 0 ) {
        throw new Error( "returnPlayInfo - Unexpected dbData results" );
    }
    return {
        gameId      : gameId, // gameId_turnIndex
        playList    : dbData.Items.map( item => item.play ) 
    }};

var snsPublish = function( playInfo ) {
    log.info('snsPublish()');
    
    var playerCount = 2; // TODO: remove hard-coded player count
    if ( playInfo.length !== playerCount ) // don't publish incomplete turn 
        return Promise.resolve();
        
    var snsParams = {
        Message: JSON.stringify( playInfo ),
        TargetArn: ENV.snsArn
    };
    return sns.publishAsync( snsParams );
}


module.exports = {
    putPlay             : putPlay,
    getPlaysForTurn     : getPlaysForTurn
}

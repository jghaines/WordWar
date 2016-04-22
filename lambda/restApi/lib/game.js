
var log = require('loglevel');
log.setLevel( log.levels.INFO );

var ENV = require('./lambda-config.json');

var Promise = require("bluebird");

var vowelCountChecker = require('./sowpods-letters-with-tuples').vowelCountChecker;
var letterGenerator = require('./sowpods-letters-with-tuples').letterGenerator;
var UUID = require('node-uuid');

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

var createTurnInfo = function( turnIndex, letterCount ) {
    return {
        turnIndex : turnIndex,
        tiles : letterGenerator( letterCount, 2, function(letters) {
            return vowelCountChecker( letters, ENV.MIN_VOWELS, ENV.MAX_VOWELS );
        })
    }
};

// 
//  [ API Gateway ]
//      v
//  [ Lambda ]
//      v
//  findOrCreateGame
//      v
//  checkForPendingGame
//      |
//      +----(existing)---->+                   found an existing game
//      |                   v
//      |               joinExstingGame
//      |                   |
//      +<--(double join)---+                   we are already in that game
//      |                   |
//      v                   v
//  createNewGame       addPlayerToGamePlayer
//      |                   |
//      |                   ||||| parallel ||||||||||||||
//      |                   v                   v       v
//      v               removeQueueMessage  getGame getPlayersForGame
//  sendGameToQueue         |                   v       v
//      |                   |||||||||||||||||||||||||||||
//      |                   |
//      |               notifyGameStart
//      |                   |
//      |                   v
//      +------------------>+
//                          v
//                      return gameInfo
// 


// AWS LAMBDA entry-point
// @event.principalId - from API Gateway authorization - Auth0 user id 
// @event.body - from REST request - optional partial Game object
//  and (optionally, for dev), gameInfo.board
// @returns Promise
var findOrCreateGame = function( event ) {    
    log.info('findOrCreateGame()');
    if ( ! event )              throw new TypeError( "Expected 'event' parameter" );
    if ( ! event.principalId )  throw new TypeError( "Expected 'event.principalId' parameter" );
    if ( ! event.body )         throw new TypeError( "Expected 'event.body' parameter" );

    var gameRequestInfo = event.body || {};
    gameRequestInfo.playerList = [ event.principalId ];

    var receiveParams = {
        QueueUrl : ENV.sqsUrl,
        VisibilityTimeout : 30 // seconds
    };
    
    return sqs.receiveMessageAsync( receiveParams )
        .then( sqsData => checkForPendingGame( gameRequestInfo, sqsData ) );
}

// see if there is a game on the queue, otherwise create one
var checkForPendingGame = function( gameRequestInfo, sqsData ) {
    log.info('checkForPendingGame()');
    if ( ! gameRequestInfo )    throw new TypeError( "Expected 'gameRequestInfo' parameter" );
    if ( ! sqsData )            throw new TypeError( "Expected 'sqsData' parameter" );

    var candidateGameSlot = null;
    var sqsHandle = null;
    if ( sqsData.Messages && sqsData.Messages.length === 1 ) {
        candidateGameSlot = JSON.parse( sqsData.Messages[0].Body );
        sqsHandle = sqsData.Messages[0].ReceiptHandle;
        if ( ! candidateGameSlot )  throw new TypeError( "Expected '.Messages[0].Body' from SQS" );
        if ( ! sqsHandle )          throw new TypeError( "Expected '..Messages[0].ReceiptHandle' from SQS" );
    }

    if ( candidateGameSlot == null // no game found 
        || candidateGameSlot.playerIdList.indexOf( gameRequestInfo.playerList[0] ) >= 0 ) { // our OWN game found
        log.debug('checkForPendingGame() - createGame');
        return Promise.try( () => createNewGame( gameRequestInfo ));
    } else if ( sqsData.Messages.length === 1 ) { // found a game on the queue
        log.debug('checkForPendingGame() - found pending');
        gameRequestInfo.gameId          = candidateGameSlot.gameId;
        gameRequestInfo.playerIndex     = candidateGameSlot.playerIndex;
        gameRequestInfo.playerId        = gameRequestInfo.playerList[0];
        if ( ! gameRequestInfo.gameId )         throw new TypeError( "Expected 'gameId' from SQS" );
        if ( ! gameRequestInfo.playerIndex )    throw new TypeError( "Expected 'playerIndex' from SQS" );
        return Promise.try( () => joinExistingGame( gameRequestInfo, sqsHandle ));
    } else {
        log.error('checkForPendingGame() - unexpected sqsData');
        throw new Error( "checkForPendingGame() - unexpected SQS data' structure: " + JSON.stringify( sqsData ));
    }
}

var joinExistingGame = function( gameRequestInfo, sqsHandle ) {
    log.info('joinExistingGame()');
    if ( ! gameRequestInfo )                throw new TypeError( "Expected 'gameRequestInfo' parameter" );
    if ( ! gameRequestInfo.gameId )         throw new TypeError( "Expected 'gameRequestInfo.gameId' parameter" );
    if ( ! gameRequestInfo.playerIndex )    throw new TypeError( "Expected 'gameRequestInfo.playerIndex' parameter" );
    if ( ! gameRequestInfo.playerId )       throw new TypeError( "Expected 'gameRequestInfo.playerId' parameter" );
    if ( ! sqsHandle )                      throw new TypeError( "Expected 'sqsHandle' parameter" );
    var returnInfoPromise = Promise
        .resolve( addPlayerToGamePlayer( gameRequestInfo ))
        .catch( err => {
            if ( err.code === "ConditionalCheckFailedException" ) {
                // conditon failed - game slot already filled or invalid gameId
                log.error( "joinExistingGame() - ConditionalCheckFailedException" ); 
                log.error( err );  
                return Promise.try( () => createNewGame( gameRequestInfo ));
            } else {
                throw new Error( err );
            }
        })
        .then( () => [
            removeQueueMessage( sqsHandle ),
            getGame( gameRequestInfo.gameId ),
            getPlayersForGame( gameRequestInfo.gameId ),
        ])
        .spread(
            ( sqsData, dbGameData, dbGamePlayerData ) => ({
                gameInfo    : dbGameData.Item,
                playerList  : dbGamePlayerData.Responses[ ENV.TableName.Player ]
            })
        )

    return returnInfoPromise.then( notifyGameStart )
        .then( () => returnInfoPromise.value() );
}

var addPlayerToGamePlayer = function( gameRequestInfo ) {
    log.info('addPlayerToGamePlayer()');
    if ( ! gameRequestInfo )                throw new TypeError( "Expected 'gameRequestInfo' parameter" );
    if ( ! gameRequestInfo.gameId )         throw new TypeError( "Expected 'gameRequestInfo.gameId' parameter" );
    if ( ! gameRequestInfo.playerIndex )    throw new TypeError( "Expected 'gameRequestInfo.playerIndex' parameter" );
    if ( ! gameRequestInfo.playerId )       throw new TypeError( "Expected 'gameRequestInfo.playerId' parameter" );

    // register player for game
    var updateParams = {
        TableName       : ENV.TableName.GamePlayer,
        Key : { 
            gameId      : gameRequestInfo.gameId,
            playerIndex : gameRequestInfo.playerIndex
        },

        UpdateExpression    : 'SET playerId = :playerId', 
        ConditionExpression : 'attribute_not_exists(playerId)',
        ExpressionAttributeValues: {
            ':playerId' : gameRequestInfo.playerId
        },
        ReturnValues        : "ALL_NEW"
    };

    return dynamo.updateAsync( updateParams )
}

// player has been added to game from queue
var removeQueueMessage = function( sqsHandle ) {
    log.info('removeQueueMessage()');
    if ( ! sqsHandle ) throw new TypeError( "Expected 'sqsHandle' parameter" );

    var deleteParams = {
        QueueUrl        : ENV.sqsUrl, 
        ReceiptHandle   : sqsHandle
    };
    return sqs.deleteMessageAsync( deleteParams );
}   

var getGame = function( gameId ) {
    log.info('getGame()');
    if ( ! gameId ) throw new TypeError( "Expected 'gameId' parameter" );
    
    var getParams = {
        TableName: ENV.TableName.Game,
        Key: { gameId : gameId }
    };
    return dynamo.getAsync( getParams );
}

var getPlayersForGame = function( gameId ) {
    log.info('getPlayersForGame()');
    if ( ! gameId ) throw new TypeError( "Expected 'gameId' parameter" );

    return getGamePlayers( gameId )
        .then( dbData => dbData.Items.map( item => item.playerId ) )
        .then( getPlayers )
}

var getGamePlayers = function( gameId ) {
    log.info('getGamePlayers()');
    if ( ! gameId ) throw new TypeError( "Expected 'gameId' parameter" );

    var queryParams = {
        TableName                   : ENV.TableName.GamePlayer,
        KeyConditionExpression      : 'gameId = :gameId',
        ExpressionAttributeValues   : { ':gameId': gameId }
    };
    return dynamo.queryAsync( queryParams );
}

var getPlayers = function( playerIdList ) {
    log.info('getPlayers()');
    if ( ! Array.isArray( playerIdList ) ) throw new TypeError( "Expected 'playerIdList' array parameter" );

    var batchGetParams = {
        RequestItems: { // map of TableName to list of Key to get from each table
            [ ENV.TableName.Player ]: {
                Keys: playerIdList.map( id => ({ playerId : id }) ),
                AttributesToGet : [
                    'playerId', 'age_range', 'family_name', 'given_name', 'nickname', 'picture'
                ]
            }
        }
    };
    return dynamo.batchGetAsync( batchGetParams );
}

var notifyGameStart = function( returnInfo ) {
    log.info('notifyGameStart()');
    if ( ! returnInfo ) throw new TypeError( "Expected 'returnInfo' parameter" );

    if ( returnInfo.playerList.length > returnInfo.gameInfo.playerCount ) { // shouldn't happen
        throw new Error( "Overfilled game " + JSON.stringify( gameInfo ));
    } else if ( returnInfo.playerList.length === returnInfo.gameInfo.playerCount ) { // we have filled the game
        var snsParams = {
            Message: JSON.stringify( returnInfo ),
            TargetArn: ENV.snsArn
        };
        return sns.publishAsync( snsParams );
    }
};

var createNewGame = function( gameRequestInfo ) {
    log.info('createNewGame()');
    if ( ! gameRequestInfo )            throw new TypeError( "Expected 'gameRequestInfo' parameter" );
    if ( ! gameRequestInfo.playerList ) throw new TypeError( "Expected 'gameRequestInfo.playerList' parameter" );
    
    var board =  gameRequestInfo.board || ENV.defaultBoard || "/boards/4.html";
    var gameInfo = {
        gameId          : UUID(),
        playerCount     : 2,
        board           : board,
        letterCount     : 10,
        startGameScore  : 100,
        turnInfo        : []        
    };
    
    for (var turnIndex = 0; turnIndex < ENV.TILE_PLAY_BLOCK; turnIndex++) {
        gameInfo.turnInfo.push( createTurnInfo( turnIndex, gameInfo.letterCount )); 
    }

    var gamePlayers = Array.from( { length : gameInfo.playerCount }, ( val, index ) => ({ 
        gameId      : gameInfo.gameId,
        playerIndex : index
    }));
    gamePlayers[0].playerId = gameRequestInfo.playerList[0]; 
        
    var batchWriteParams = {
        RequestItems: {
            [ ENV.TableName.Game ] : [ {
                PutRequest : {
                    Item: gameInfo
                }    
            }],
            [ ENV.TableName.GamePlayer ] : gamePlayers.map( player => ({
                PutRequest : { 
                    Item : player
                }
            }))
        }
    };
    
    return dynamo.batchWriteAsync( batchWriteParams )
        .then( () => sendGameToQueue( gamePlayers ))
        .then( () => (gameInfo) );
}

var sendGameToQueue = function( gamePlayers ) {
    log.info('sendGameToQueue()');
    if ( ! Array.isArray( gamePlayers )) throw new TypeError( "Expected array 'gamePlayers' parameter" );

    var nextPlayerSlot = gamePlayers.find( gamePlayer => gamePlayer.playerId == null )
    
    if ( nextPlayerSlot == null) {
        return;
    }

    // advertise pending game on Queue
    var sendParams = {
        QueueUrl : ENV.sqsUrl,
        MessageBody : JSON.stringify( {
            gameId          : nextPlayerSlot.gameId,
            playerIndex     : nextPlayerSlot.playerIndex,
            playerIdList    : gamePlayers.map( gamePlayer => ( gamePlayer.playerId != null ) )
        } )
    };
    return sqs.sendMessageAsync( sendParams );
}

module.exports = {
    findOrCreateGame : findOrCreateGame
}

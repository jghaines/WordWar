
var log = require('loglevel');
log.setLevel( log.levels.INFO );

var ENV = require('./lambda-config.json');

var Promise = require("bluebird");

var vowelCountChecker = require('./sowpods-letters-with-tuples').vowelCountChecker;
var letterGenerator = require('./sowpods-letters-with-tuples').letterGenerator;
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
//  getGame
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
//  createNewGame       removeQueueMessage
//      |                   |
//      v                   v
//  sendGameToQueue     notifyGameStart
//      |                   |
//      +------------------>+
//                          v
//                      return gameInfo
// 


// AWS LAMBDA entry-point
// @event.principalId - from API Gateway authorization - Auth0 user id 
// @event.body - from REST request - optional partial Game object
//  and (optionally, for dev), gameInfo.board
// @returns Promise
var getGame = function( event ) {    
    log.info('getGame()');
    iz( event ).required();
    iz( event.principalId ).required();
    iz( event.body ).required();


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
    iz( gameRequestInfo ).required();
    iz( sqsData ).required();

    var candidateGame = null;
    if ( sqsData.Messages && sqsData.Messages.length === 1 ) {
        candidateGame = JSON.parse( sqsData.Messages[0].Body );
    }

    if ( candidateGame === null // no game found 
        || candidateGame.playerList.indexOf( gameRequestInfo.playerList[0]) >= 0 ) { // our OWN game found
        log.debug('checkForPendingGame() - createGame');
        return Promise.try( () => createNewGame( gameRequestInfo ));
    } else if ( sqsData.Messages.length === 1 ) { // found a game on the queue
        log.debug('checkForPendingGame() - found pending');
        gameRequestInfo.gameId = candidateGame.gameId;
        var sqsHandle = sqsData.Messages[0].ReceiptHandle;

        iz( gameRequestInfo.gameId ).required().uuid();
        iz( sqsHandle ).required().not().blank();

        return Promise.try( () => joinExistingGame( gameRequestInfo, sqsHandle ));
    } else {
        log.error('checkForPendingGame() - unexpected sqsData');
        throw new Error( "checkForPendingGame() - unexpected SQS data' structure: " + JSON.stringify( sqsData ));
    }
}

var joinExistingGame = function( gameRequestInfo, sqsHandle ) {
    log.info('joinExistingGame()');
    iz( gameRequestInfo.gameId ).required().uuid();
    iz( gameRequestInfo.playerList ).anArray().minLength( 1 ).maxLength( 1 );
    iz( sqsHandle ).required();
    
    // register player for game
    var updateParams = {
        TableName           : ENV.TableName.Game,
        Key                 : { gameId : gameRequestInfo.gameId },
        UpdateExpression    : "SET #playerList = list_append( #playerList, :newPlayerList )",
        ConditionExpression : "NOT contains( #playerList, :newPlayer )",
        ExpressionAttributeNames : {
            "#playerList" : "playerList"
        },
        ExpressionAttributeValues : {
            ":newPlayer"        : gameRequestInfo.playerList[0],
            ":newPlayerList"    : gameRequestInfo.playerList
        },
        ReturnValues        : "ALL_NEW"
    };

    return dynamo.updateAsync( updateParams )
        .catch( err => {
            if ( err.code === "ConditionalCheckFailedException" ) {
                // conditon failed - invalid game Id?
                log.error( "" )  
                return Promise.try( () => createNewGame( gameRequestInfo ));
            } else {
                throw new Error( err );
            }
        })
        .then( dbData => removeQueueMessage( sqsHandle, dbData ) );
}

// player has been added to game from queue
var removeQueueMessage = function( sqsHandle, dbData ) {
    log.info('removeQueueMessage()');
    iz( sqsHandle ).required();
    iz( dbData ).required()
    iz( dbData.Attributes ).required();

    var gameInfo = dbData.Attributes;

    var deleteParams = {
        QueueUrl : ENV.sqsUrl, 
        ReceiptHandle: sqsHandle
    };
    return sqs.deleteMessageAsync( deleteParams )
        .then( () => notifyGameStart( gameInfo ))
        .then( () => gameInfo );
}

var notifyGameStart = function( gameInfo ) {
    log.info('notifyGameStart()');
    iz( gameInfo ).required();
    iz( gameInfo.gameId ).required().uuid();
    iz( gameInfo.playerList ).anArray().minLength( 1 );

    if ( gameInfo.playerList.length > gameInfo.playerCount ) { // shouldn't happen
        throw new Error( "Overfilled game " + JSON.stringify( gameInfo ));
    } else if ( gameInfo.playerList.length === gameInfo.playerCount ) { // we have filled the game
        var snsParams = {
            Message: JSON.stringify( gameInfo ),
            TargetArn: ENV.snsArn
        };
        return sns.publishAsync( snsParams );
    }
};

var createNewGame = function( gameRequestInfo ) {
    log.info('createNewGame()');
    iz( gameRequestInfo ).required();
    iz( gameRequestInfo.playerList ).anArray().minLength( 1 ).maxLength( 1 );
    
    var board =  gameRequestInfo.board || ENV.defaultBoard || "/boards/4.html";
    var gameInfo = {
        gameId          : UUID(),
        playerList      : gameRequestInfo.playerList,
        playerCount     : 2,
        board           : board,
        letterCount     : 10,
        startGameScore  : 100,
        turnInfo        : []        
    };
    
    for (var turnIndex = 0; turnIndex < ENV.TILE_PLAY_BLOCK; turnIndex++) {
        gameInfo.turnInfo.push( createTurnInfo( turnIndex, gameInfo.letterCount )); 
    }
    
    var putParams = {
        TableName   : ENV.TableName.Game,
        Item        : gameInfo
    };
    return dynamo.putAsync( putParams )
        .then( () => sendGameToQueue( gameInfo ))
        .then( () => gameInfo );
}

var sendGameToQueue = function( gameInfo ) {
    log.info('sendGameToQueue()');
    iz( gameInfo ).required();
    iz( gameInfo.gameId ).required().uuid();
    iz( gameInfo.playerList ).anArray().minLength( 1 );

    // advertise pending game on Queue
    var sendParams = {
        QueueUrl : ENV.sqsUrl,
        MessageBody : JSON.stringify( gameInfo )
    };
    return sqs.sendMessageAsync( sendParams );
}

module.exports = {
    getGame         : getGame
}

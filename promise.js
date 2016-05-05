var Promise = require("bluebird");

var sqs_receiveMessage = Promise.promisify( function( params, callback ) {
    console.log("sqs_receiveMessage");
    var hasMessage = ( Math.random() < 0.5 );
    setImmediate( function() {
        callback( null, { Message : { gameId : 'game-from-sqs' }, hasMessage : hasMessage }) 
    });
    return { error: "ignoreMe!"}
});

var sqs_deleteMessage = Promise.promisify( function( params, callback ) {
    console.log("sqs_deleteMessage");
    setImmediate( callback( null, { Message : { gameId : 'game-from-sqs' } }) );
    return { error: "ignoreMe!"}
});


var dynamo_update = Promise.promisify( function( params, callback ) {
    console.log("dynamo_update");
    setImmediate( callback( null, { dynamoData : { gameId : 'game-from-dynamo', tileCount: 10 } }) );
    return { error: "ignoreMe!"}
});
/********************/

var getGameFromQueue = function( params ) {
    console.log("getGameFromQueue");
    return sqs_receiveMessage( {} );
}; 

var receiveQueueMessage = function( sqsData ) {
    console.log("receiveQueueMessage");
    global.sqs.push( sqsData.hasMessage );
    global.sqs.push( "Received" );
    if ( sqsData.hasMessage ) {
        return Promise.try( function() { addPlayerToExistingGame( sqsData ); } )
            .then( removeGameFromQueue );
    } else {
        return Promise.try( createNewGame );
    }
}

var addPlayerToExistingGame = function( sqsData ) {
    console.log("addPlayerToExistingGame");
    global.gameInfo = { gameId : sqsData.Message.gameId };

    return dynamo_update( {} );
}

var createNewGame = function( ) {
    console.log("createNewGame");
    global.gameInfo = { gameId : "new" };

    return global.gameInfo;
}

var removeGameFromQueue = function( dynamoData ) {
    console.log("removeGameFromQueue");
    global.sqs.push( "Removed" );
    global.db.push( "Updated" );
    global.gameInfo = dynamoData;
    
    return sqs_deleteMessage( {} );
}


var global = {
    sqs:[],
    db:[]
};

var getGame = function( data, callback ) {
    return Promise.try( getGameFromQueue )
        .then( receiveQueueMessage )
        .then( function( params ) {
            console.log( 'Done' );
            console.log( JSON.stringify( global ));
            callback( null, params );
        })
        .catch( function( err ) {
            console.error("Error");
            console.error(err);
            callback( err );
        })
}



var lambda = function( event, context ) {
    console.log("Lambda");

    var myGetGame = Promise.promisify( getGame );
    myGetGame( event ).then( function( result ) {
        console.log("Lambda - then");
        console.log("Globals:" + JSON.stringify(global));
        context.succeed( result );
    }).catch( function( err ) {
        console.log("Lambda - catch");
        console.log("Globals:" + JSON.stringify(global));
        context.fail( err );
    });
};

lambda( {}, {
    succeed : function( params ) { console.log( "lambda.succeed(" + JSON.stringify(params) + ")")},
    fail : function( err ) { console.log( "lambda.fail(" + JSON.stringify(err) + ")")},
    done : function( err, params ) { console.log( "lambda.done(<err>, params = " + params + ")"); if (err) this.fail(err) }
    
} )




// var game = gameFactory.getGame({}).then( gameFactory.addPlayer );  

//console.log( JSON.stringify( game ));
 
 /*
 getGameFromQueue()
    .then( addPlayerToExistingGame )
    .then( playerAddedToGameDb ) // removeGameFromQueue
    .then( pendingGameDeletedFromQueue )
    .then( returnGameInfo )
    
    */
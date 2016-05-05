var Promise = require("bluebird");

/*********************/
var sqs = Promise.promisifyAll( {
    receiveMessage :  function( params, callback ) {
        setImmediate( function() {
            var sqsData = ( Math.random() < 0.5 ? {} : { Messages : [ { msg : "Received from Queue" }]} ); // return Message 50% of the time
            callback( null, sqsData ); 
        });
    },
    deleteMessage :  function( params, callback ) {
        setImmediate( callback( null, {}));
    },
    sendMessage : function( params, callback ) {
        setImmediate( callback( null, {} ));
    }
});

var context = {
    succeed : function( params ) { console.log( "lambda.succeed(" + JSON.stringify(params) + ")")},
    fail : function( err ) { console.error( "lambda.fail"); console.error(err)},
    done : function( err, params ) { console.log( "lambda.done(<err>, params = " + params + ")"); if (err) this.fail(err) }   
};
/********************/

var queueData = {};

var requestFromQueue = function( params ) {
    console.log("requestFromQueue");
    var sqsParams = { /**/ };
    return sqs.receiveMessageAsync( sqsParams );
}; 

var receiveFromQueue = function( sqsData ) {
    console.log("receiveFromQueue");
    if ( sqsData.Messages ) {
        queueData = sqsData.Messages[0]; 
        return Promise.try( function() { deleteFromQueue( sqsData ); } );
    } else {
        return Promise.try( sendToQueue );
    }
}

var deleteFromQueue = function( sqsData ) {
    console.log("deleteFromQueue");
    var sqsParams = { /**/ };
    return sqs.deleteMessageAsync( sqsParams );
}

var sendToQueue = function( ) {
    console.log("sendToQueue");
    queueData = { msg : "Sent to Queue" }; 
    var sqsParams = { /**/ };
    return sqs.sendMessageAsync( sqsParams );
}


var doLogic = function( data, callback ) {
    return Promise.try( requestFromQueue )
        .then( receiveFromQueue )
        .then( function( params ) {
            callback( null, queueData );
        })
        .catch( function( err ) {
            callback( err );
        })
}

var lambda = function( event, context ) {
    var myDoLogic= Promise.promisify( doLogic );
    myDoLogic( event ).then( function( result ) {
        context.succeed( result );
    }).catch( function( err ) {
        context.fail( err );
    });
};

lambda( {}, context );

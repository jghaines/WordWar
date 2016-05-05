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



/********************/

var QueueManager = function() {
    this.queueData = {};

    this.requestFromQueue = function( params ) {
        console.log("requestFromQueue");
        return sqs.receiveMessageAsync( { /*sqsParams*/ } );
    }; 

    this.receiveFromQueue = function( sqsData ) {
        console.log("receiveFromQueue");
        if ( sqsData.Messages ) {
            this.queueData = sqsData.Messages[0]; 
            return Promise.try( (function() { this.deleteFromQueue( sqsData ); }).bind( this ) )
                .next( this.getQueueData.bind( this ));
        } else {
            return Promise.try( this.sendToQueue.bind( this ))
                .next( this.getQueueData.bind( this ));
        }
    }

    this.deleteFromQueue = function( sqsData ) {
        console.log("deleteFromQueue");
        return sqs.deleteMessageAsync( { /* sqsParams */ } );
    }

    this.sendToQueue = function( ) {
        console.log("sendToQueue");
        this.queueData = { msg : "Sent to Queue" }; 
        return sqs.sendMessageAsync( { /* sqsParams */ } );
    }

    this.getQueueData = function() {
        return this.queueData;
    }

    this.doLogic = function( data, callback ) {
        console.log("doLogic");
        return Promise.try( this.requestFromQueue.bind( this ) )
            .then( this.receiveFromQueue.bind( this ) )
            .catch( function( err ) { callback( err, null ) } );
    }
}

var lambda = function( event, context ) {
    var queueManager = new QueueManager();
    queueManager.doLogic( event, function( err, result ) {
        context.done( err, result );
    })

/*    Promise.try( queueManager.doLogic.bind( queueManager ) )
        .then( function( result ) {
            context.succeed( result );
        }).catch( function( err ) {
            context.fail( err );
        });
        */
};

/* simulate Lambda invocation with empty event and simulated context */
lambda( {}, {
    succeed : function( params ) { console.log( "lambda.succeed(" + JSON.stringify(params) + ")")},
    fail : function( err ) { console.error( "lambda.fail"); throw(err)},
    done : function( err, params ) { console.log( "lambda.done(<err>, params = " + params + ")"); if (err) this.fail(err) }
    
} );

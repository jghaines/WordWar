#!/usr/bin/env node
/* global Buffer */

var log = require('loglevel');
log.setLevel( log.levels.DEBUG );

var AWS = require('aws-sdk');
AWS.config.apiVersions = {
    dynamodb: '2012-08-10',
    lambda: '2015-03-31',
    sns: '2010-03-31',
    sqs: '2012-11-05'
};
AWS.config.update({region: 'us-west-2'});
var sns = new AWS.SNS();

var express = require('express');
var app = express();
var http = require('http').Server(app);
var sio = require('socket.io')(http);
var UUID = require('node-uuid');
var gameServer = require('./game.server.js');


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/client'));

app.get('/hello', function(req, res){
  res.send('<h1>WordWar app server</h1>');
});

app.post('/GameEvent', function(req, res){
    log.info( "/GameEvent ");

    var bodyarr = []
    req.on('data', function(chunk){
      bodyarr.push.apply( bodyarr, chunk ); // array append
    })  
    req.on('end', function(){
        var body = JSON.parse( (new Buffer( bodyarr )).toString('utf-8'));

        if ( body.Type === "SubscriptionConfirmation" ) {
            var params = {
                Token: body.Token,
                TopicArn: body.TopicArn
            };
            sns.confirmSubscription(params, function(err, data) {
                if (err) log.error(err, err.stack); // an error occurred
                else     log.info(data);           // successful response
            });        
        } else if ( body.Type === "Notification" ) {
            var message = JSON.parse( body.Message );
            log.debug( JSON.stringify( message ));
        }
        res.json( body );
    })  
});



sio.on('connection', function (client) {
	console.log('connection - client.id=', client.id, ' client.userId=', client.userId);

	//Generate a new UUID, looks something like
	//5b2ca132-64bd-4513-99da-90e838ca47d1
	//and store this on their socket/connection
    client.userId = UUID();

	//tell the player they connected, giving them their id
	client.emit('userId', { userId: client.userId } );

	//Now we want to handle some of the messages that clients will send.
	//They send messages here, and we send them to the game_server to handle.
	client.on('player', function( m )  {
	    gameServer.findGame( m.userId, client );
	});

	client.on('play message', function(m) {
		gameServer.onPlayMessage(client, m);
	});
});

sio.on('reconnection', function (client) {
	console.log('reconnection');
	console.log(client.id);
});


sio.on('reconnect', function (client) {
	console.log('reconnect');
	console.log(client.id);
});


sio.on('disconnect', function (client) {
	console.log('disconnect');
	console.log(client);
});

http.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

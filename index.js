#!/usr/bin/env node

var log = require('loglevel');
log.setLevel('DEBUG');

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

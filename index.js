var log = require('loglevel');
log.setLevel('INFO');

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
	log.debug('connection');
    
        //Generate a new UUID, looks something like
        //5b2ca132-64bd-4513-99da-90e838ca47d1
        //and store this on their socket/connection
    client.userid = UUID();

        //tell the player they connected, giving them their id
    client.emit('onconnected', { id: client.userid } );

        //now we can find them a game to play with someone.
        //if no game exists with someone waiting, they create one and wait.
    gameServer.findGame(client);

        //Now we want to handle some of the messages that clients will send.
        //They send messages here, and we send them to the game_server to handle.
    client.on('play message', function(m) {

        gameServer.onMessage(client, m);

    }); //client.on message
});


http.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

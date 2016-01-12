var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cors = require('cors');

var app = express();
app.use(cors());

io.on('connection', function(socket){
	console.log('a user connected');

	socket.on('chat message', function(msg){
		console.log('message: ' + msg);
		io.emit('chat message', msg);
	});

	socket.on('play message', function(msg){
		console.log('recv play message: ' + msg);
		msg.player = 1 - msg.player; // 0 <-> 1
		setTimeout(function() {
			console.log('send play message: ' + msg);
			io.emit('play message', msg);
		}, 1000);
	});

	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});

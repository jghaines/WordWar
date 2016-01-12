var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/client'));

app.get('/hello', function(req, res){
  res.send('<h1>WordWar app server</h1>');
});


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

http.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

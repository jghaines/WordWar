var gameController = {};
var remote = {};

window.onload = function(){
	log.setLevel('DEBUG');
	log.info('main()');

	var socket = io('http://localhost:3000');
	remote = new RemoteController(socket);
	gameController = new GameController(remote);
}


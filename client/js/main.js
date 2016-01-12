var gameController = {};
var remote = {};

window.onload = function(){
	log.setLevel('DEBUG');
	log.info('main()');

	var socket = io();
	remote = new RemoteController(socket);
	gameController = new GameController(remote);
}

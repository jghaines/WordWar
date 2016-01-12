var gameController = {};
var remote = {};

window.onload = function(){
	log.setLevel('DEBUG');
	log.info('main()');

	//var app_url = 'https://wordwar.herokuapp.com/';
	var app_url = 'http://localhost:3000';
	var socket = io(app_url);
	remote = new RemoteController(socket);
	gameController = new GameController(remote);
}


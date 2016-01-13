var gc = {};
var remote = {};

window.onload = function(){
	log.setLevel('DEBUG');
	log.info('main()');

	var socket = io();
	remote = new RemoteController(socket);
	gc = new GameController(remote);
}

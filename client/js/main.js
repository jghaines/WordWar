'use strict';

var gc = {};

window.onload = function(){
	var socket = io();
	var remote = new RemoteController(socket);
	var scoreStrategy = new AttackBeatsMove();

	gc = new GameController(remote, scoreStrategy);
}

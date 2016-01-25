'use strict';

var gc = {};

window.onload = function(){
	var socket = io();
	var remote = new RemoteController(socket);
	//var scoreStrategy = new AttackBeatsMove();
	var scoreStrategy = new AttackPenalisesMove();

	gc = new GameController(remote, scoreStrategy);
}

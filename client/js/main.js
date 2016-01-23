'use strict';

var gc = {};
var remote = {};

window.onload = function(){
	var socket = io();
	remote = new RemoteController(socket);
	gc = new GameController(remote);
}

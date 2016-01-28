'use strict';

var gc = {};

window.onload = function(){
	var socket = io();
	var remote = new RemoteController(socket);
	//var scoreStrategy = new AttackBeatsMove();
	var scoreStrategy = new AttackPenalisesMove();
	var attackRangeStrategy = new StaticDistanceAttackRangeStrategy(2);

	gc = new GameController( remote, scoreStrategy, attackRangeStrategy );
}

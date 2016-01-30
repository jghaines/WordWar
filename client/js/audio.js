'use strict';

function AudioProxy() {
	this.endTurn = function() {
		var audio = new Audio('/audio/endturn.mp3');
		audio.play();
	}
}

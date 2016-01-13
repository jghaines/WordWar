'use strict';

function Play(word, score, playRange, newPosition) {
	this.loadFromJson = function(json) {
		this.player 		= json.player;
		this.word			= json.word;
		this.score			= json.score;
		this.playRange		= json.playRange;
		this.newPosition 	= json.newPosition;
	}

	// constructor code
	this.player 		= 0;
	this.word			= word;
	this.score			= score;
	this.playRange		= playRange;
	this.newPosition 	= newPosition;
}

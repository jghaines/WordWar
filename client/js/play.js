'use strict';

function Play( moveType, word, wordValue, playRange, newPosition ) {

	this.loadFromJson = function( json ) {
		this.player 		= json.player;
		this.moveType		= json.moveType;
		this.word			= json.word;
		this.wordValue		= json.wordValue;
		this.playRange		= json.playRange;
		this.newPosition 	= json.newPosition;

		this.score			= json.score;
	}

	// constructor code
	this.player 		= 0;
	this.moveType 		= moveType;
	this.word			= word;
	this.wordValue		= wordValue;
	this.playRange		= playRange;
	this.newPosition 	= newPosition;

	this.score			= wordValue;

}

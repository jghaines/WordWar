'use strict';

function Play( moveType, word, wordValue, playRange, newPosition ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.loadFromJson = function( json ) {
		this.player 		= json.player;
		this.moveType		= json.moveType;
		this.word			= json.word;
		this.wordValue		= json.wordValue;
		this.playRange		= new CoordRange();
		this.newPosition 	= new Coordinates();

		this.score			= json.score;

		this.playRange.loadFromJson( json.playRange );
		this.newPosition.loadFromJson( json.newPosition );
	}

	this.toJSON = function() {
		return {
			player: 	this.player,
			moveType: 	this.moveType,
			word: 		this.word,
			wordValue: 	this.wordValue,
			playRange: 	this.playRange,
			newPosition:this.newPosition,
			score: 		this.score
		};
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

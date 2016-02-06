'use strict';

function Play( moveType, word, wordValue, playRange, newPosition, attackMultiplier ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.loadFromJson = function( json ) {
		this.player 			= json.player;
		this.moveType			= json.moveType;
		this.word				= json.word;
		this.wordValue			= json.wordValue;
		this.attackMultiplier 	= json.attackMultiplier;
		this.score				= json.score;

		this.playRange			= new CoordRange();
		this.newPosition 		= new Coordinates();
		this.playRange.loadFromJson( json.playRange );
		this.newPosition.loadFromJson( json.newPosition );
	}

	this.toJSON = function() {
		return {
			player: 			this.player,
			moveType: 			this.moveType,
			word: 				this.word,
			wordValue: 			this.wordValue,
			playRange: 			this.playRange,
			newPosition:		this.newPosition,
			attackMultiplier: 	this.attackMultiplier,
			score: 				this.score
		};
	}

	// -1 if this beats other
	//  0 if this ties with other
	// +1 if loses to other
	this.cmp = function( other ) {
		if ( this.moveType != other.moveType ) { // attack vs move			
			return ( this.moveType == 'attack' ? 1 : -1 ); // attack beats move

		} else if ( this.score > other.score ) { // higher score wins
			return 1;

		} else if ( other.score > this.score ) {
			return -1;

		} else if ( this.word.length > other.word.length ) { // longer word wins
			return 1;

		} else if ( other.word.length > this.word.length ) {
			return -1;

		} else if ( this.word > other.word ) { // alphabetical later word wins
			return 1;

		} else if ( other.word > this.word ) {
			return -1;

		} else { // tie
			return 0;
		}

	}

	// constructor code
	this.player 			= 0;
	this.moveType 			= moveType;
	this.word				= word;
	this.wordValue			= wordValue;
	this.playRange			= playRange;
	this.newPosition 		= newPosition;
	this.attackMultiplier 	= attackMultiplier;

	this.score				= 0;
}

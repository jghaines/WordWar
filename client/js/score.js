'use strict';

function ScoreModel() {
	this.setScore = function( who, score ) {
		this._score[who].text( score );
	}

	this.getScore = function( who ) {
		return parseInt( this._score[who].text() );
	}

	this.incrementScore = function( who, value ) {
		this.setScore( who, this.getScore( who ) + value );
	}

	this.setLost = function( who, hasLost ) {
		this._score[who].toggleClass( 'lost', hasLost );
	}

	// constructor
	this._score = {
		'local': 	$( 'span.score.local' ),
		'remote': 	$( 'span.score.remote' ),
	};
	this.setScore( 'local', 0 );
	this.setScore( 'remote', 0 );
}

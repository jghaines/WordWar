'use strict';

function ScoreModel() {
	this.setScore = function( who, score ) {
		this._score[who].text( score );
	}

	this.getScore = function( who ) {
		this._score[who].text();
	}

	this._score = {
		'local': 	$( 'span.score.local' ),
		'remote': 	$( 'span.score.remote' ),
	};

	this.setScore( 'local', 0 );
	this.setScore( 'remote', 0 );
}

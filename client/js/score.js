'use strict';

function ScoreModel() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.setScore = function( playerIndex, score ) {
		this._score[playerIndex].text( score );
		this._updated();
	}

	this.getScore = function( playerIndex ) {
		return parseInt( this._score[playerIndex].text() );
	}

	this.incrementScore = function( playerIndex, value ) {
		this.log.debug( this.constructor.name, '.incrementScore( playerIndex=', playerIndex, 'value=', value, ')' );
		this.setScore( playerIndex, this.getScore( playerIndex ) + value );
		this._updated();
	}

	this.setLost = function( playerIndex, hasLost ) {
		this._score[playerIndex].toggleClass( 'lost', hasLost );
		this._updated();
	}

	this.setAttackMultiplier = function( attackMultiplier ) {
		this.log.debug( this.constructor.name, '.setAttackMultiplier(', attackMultiplier, ')' );
		this._attackMultiplier = attackMultiplier;
		this._updated();
	}

	this.getAttackMultiplier = function() {
		return this._attackMultiplier;
	}

	// regisiter callback
	this.onUpdate = function( callback ) {
		this._onUpdateCallbacks.add( callback );
	}

	// fire callback
	this._updated = function() {
		this._onUpdateCallbacks.fire( this );
	}

	// constructor
	this._onUpdateCallbacks = $.Callbacks();

	this._score = [
		$( 'span.score.player-0' ),
		$( 'span.score.player-1' ),
	];

	this.setAttackMultiplier( 0 );
}

'use strict';

function ScoreModel() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.setScore = function( who, score ) {
		this._score[who].text( score );
		this._updated();
	}

	this.getScore = function( who ) {
		return parseInt( this._score[who].text() );
	}

	this.incrementScore = function( who, value ) {
		this.log.debug( this.constructor.name, '.incrementScore( who=', who, 'value=', value, ')' );
		this.setScore( who, this.getScore( who ) + value );
		this._updated();
	}

	this.setLost = function( who, hasLost ) {
		this._score[who].toggleClass( 'lost', hasLost );
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

	this._score = {
		'local': 	$( 'span.score.local' ),
		'remote': 	$( 'span.score.remote' ),
	};
	this.setScore( 'local',  0 );
	this.setScore( 'remote', 0 );

	this.setAttackMultiplier( 0 );
}

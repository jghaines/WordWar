'use strict';

function ScoreModel() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

    this._scores = [];

	this.setScore = function( playerIndex, score ) {
		this._scores[playerIndex] = score;
		this._updated();
	}

	this.incrementScore = function( playerIndex, value ) {
		this.log.debug( this.constructor.name, '.incrementScore( playerIndex=', playerIndex, 'value=', value, ')' );

        var score = this._scores[playerIndex] || 0;
        score += value;
        this._scores[playerIndex] = score;

		this._updated();
	}

	this.getScore = function( playerIndex ) {
        return this._scores[playerIndex];
	}

	this.getAllScores = function() {
        return this._scores;
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

	this.setAttackMultiplier( 0 );
}


function ScoreView( scoreModel ) {

    // called-back when ScoreModel is updates
    this._update = function() {
        this._scoreModel.getAllScores().forEach( (function( score, index ) {
            var ui = this._getUiForPlayerIndex( index );
            ui.text( score );
        }).bind(this) );
    }
    
    this._getUiForPlayerIndex = function( playerIndex ) {
        return $( 'span.score.player-' + playerIndex );
    }

	this.setLost = function( playerIndex, hasLost ) {
		this._getUiForPlayerIndex( playerIndex ).toggleClass( 'lost', hasLost );
	}

    this._scoreModel = scoreModel;
    // bind callback
    this._scoreModel.onUpdate( this._update.bind( this ));
}

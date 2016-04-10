'use strict';

function Play( parameters ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

    this.loadFromGameInfo = function( playerIndex, gameInfo ) {
        this.gameId             = gameInfo.gameId, 
        this.turnIndex          = 0,
        this.playerIndex        = playerIndex;
        this.lost               = false;

        this.playComplete       = false;
		this.playType			= null;
		this.word				= '';

		this.wordPoints			= 0;
		this.turnPoints	        = 0;

		this.startAttackMultiplier 	= 0;
		this.endAttackMultiplier 	= 0;

        this.startTurnScore     = gameInfo.startGameScore || 0;
		this.endTurnScore	    = 0;

		this.endWordPosition = null;

		this.startPosition = null;
		this.endPosition  = null;
    }
    
	this.createNextTurnPlay = function( previousPlay ) {
        var next = new Play();
        
        next.gameId           = this.gameId;
        next.turnIndex        = this.turnIndex + 1; // next turnIndex
        next.playerIndex      = this.playerIndex;
        next.lost             = this.lost;

        next.playComplete   = false;
		next.playType	    = null;
		next.word		    = '';

		next.wordPoints			= 0;
		next.turnPoints	        = 0;

		next.startAttackMultiplier 	= this.endAttackMultiplier;

        next.startTurnScore     = this.endTurnScore; // endTurnScore -> startTurnScore
		next.endTurnScore	    = 0;

        next.startPosition      = this.endPosition; // endPosition -> startPosition
        next.endPosition        = null;
        
        return next;
    }
    
	this.loadFromJson = function( json ) {
		this.gameId 			= json.gameId || null;
		this.turnIndex 			= json.turnIndex || 0;
		this.playerIndex  		= json.playerIndex || 0;
		this.lost				= json.lost || false;

        this.playComplete       = json.playComplete || false,
		this.playType			= json.playType || null;
		this.word				= json.word || '';

		this.wordPoints			= json.wordPoints || 0;
		this.turnPoints	        = json.turnPoints || 0;

		this.startAttackMultiplier 	= json.startAttackMultiplier || 0;
		this.endAttackMultiplier 	= json.endAttackMultiplier || 0;

		this.startTurnScore	    = json.startTurnScore || 0;
		this.endTurnScore	    = json.endTurnScore || 0;

		this.endWordPosition	= new Coordinates();
		if ( typeof json.endWordPosition !== 'undefined' ) this.endWordPosition.loadFromJson( json.endWordPosition );

		this.startPosition 		= new Coordinates();
		if ( typeof json.startPosition !== 'undefined' ) this.startPosition.loadFromJson( json.startPosition );
		this.endPosition 		= new Coordinates();
		if ( typeof json.endPosition !== 'undefined' ) this.endPosition.loadFromJson( json.endPosition );
	}

	this.toJSON = function() {
		var json = {
			gameId              : this.gameId,
			turnIndex           : this.turnIndex,
			playerIndex         : this.playerIndex,
			lost                : this.lost,
            
			playComplete        : this.playComplete,
			playType            : this.playType,
			word                : this.word,
            
			wordPoints          : this.wordPoints,
            turnPoints          : this.turnPoints,

			startAttackMultiplier   : this.startAttackMultiplier,
			endAttackMultiplier     : this.endAttackMultiplier,

            startTurnScore	    : this.startTurnScore,
            endTurnScore	    : this.endTurnScore,
		};
		if ( this.endWordPosition ) 	json.endWordPosition = this.endWordPosition.toJSON();
		if ( this.startPosition   ) 	json.startPosition   = this.startPosition.toJSON();
		if ( this.endPosition )		    json.endPosition     = this.endPosition.toJSON();

		return json;
	}

	// +1 if this beats     other
	//  0 if this ties with other
	// -1 if this loses to  other
	this.cmp = function( other ) {
		if ( this.playType != other.playType ) { // attack vs move			
			return ( this.playType == 'attack' ? 1 : -1 ); // attack beats move

		} else if ( this.turnPoints > other.turnPoints ) { // higher turnPoints wins
			return 1;

		} else if ( other.turnPoints > this.turnPoints ) {
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

    this.toPlayDescription = function() {
        return '' +
            this.playType.toTitleCase() + 
			( this.playType === 'attack' ? ' (x' + this.startAttackMultiplier + ')' : '' ) +
            ': ' + 
            this.word + ' ' + 
			( this.turnPoints >= 0 ? '+' : '' ) +
			this.turnPoints;
    }
    
    this.toPlayPointsInfo = function() {
        return '' +
            this.startTurnScore + ' + ' +
            this.turnPoints + ' = ' + 
			this.endTurnScore;
    }
    
	// constructor code
	parameters = parameters || {};
    this.loadFromJson( parameters );
}

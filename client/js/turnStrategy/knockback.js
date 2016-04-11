'use strict';

function KnockBackPlayStrategy() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this._arePlayersOnSameCell = function( plays ) {
 		return ( plays[0].endPosition.equals( plays[1].endPosition ));
	}

	this._knockBackPlayer = function( play ) {
		this.log.info( this.constructor.name + '.knockBackPlayer(.)' );

		if ( play.startPosition.row === play.endPosition.row ) { // horizontal move
			if ( play.startPosition.col < play.endPosition.col ) { // left-to-right
				play.endPosition = play.endPosition.getIncrement( 0, -1 );
			} else if ( play.startPosition.col > play.endPosition.col ) { // right-to-left
				play.endPosition = play.endPosition.getIncrement( 0, 1 );
			} else {
				throw new Error ( this.constructor.name + '.retreatPlayer() uhnhandled horizontal retreat');
			}

		} else if ( play.startPosition.col === play.endPosition.col ) { // vertical move
			if ( play.startPosition.row < play.endPosition.row ) { // top-to-bottom
				play.endPosition = play.endPosition.getIncrement( -1, 0 );
			} else if ( play.startPosition.row > play.endPosition.row ) { // bottom-to-top 
				play.endPosition = play.endPosition.getIncrement( 1, 0 );
			} else {
				throw new Error ( this.constructor.name + '.retreatPlayer() uhnhandled vertical retreat');
			}

		} else {
			throw new Error ( this.constructor.name + '.retreatPlayer() uhnhandled directional retreat');			
		}
	}

	this.execute = function( plays ) {
        if ( plays.length !== 2 ) throw new Error( this.constructor.name + '.execute(plays) expects two players' );
		plays.forEach( (function( play ) {
            if ( typeof play.startPosition === 'undefined' ) throw new Error( this.constructor.name + '.execute(play) play.startPosition undefined' );
            if ( typeof play.endPosition === 'undefined' ) throw new Error( this.constructor.name + '.execute(play) play.endPosition undefined' );
        }).bind( this ));
        
		// if players have landed on same cell, retreat both players
		if ( this._arePlayersOnSameCell( plays ) ) {
			switch ( plays[0].cmp( plays[1] )) {
				case -1 : 	this._knockBackPlayer( plays[0] );
							break;
				case 0 : 	this._knockBackPlayer( plays[0] );
							this._knockBackPlayer( plays[1] );
							break;
				case 1 : 	this._knockBackPlayer( plays[1] );
							break;
			}
		}
	}
}
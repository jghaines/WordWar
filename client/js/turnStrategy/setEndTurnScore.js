'use strict';

function SetEndTurnStrategy() {
	this.calculateScore = function( plays ) {
 		plays.forEach( (function( play ) {
            if ( typeof play.startTurnScore === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.startTurnScore undefined' );
            if ( typeof play.turnPoints === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.turnPoints undefined' );
            play.endTurnScore = play.startTurnScore + play.turnPoints;
		}).bind( this ) );
	}
}

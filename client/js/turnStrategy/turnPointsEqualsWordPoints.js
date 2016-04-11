'use strict';

function TurnPointsEqualsWordPointsStrategy() {
	this.calculateScore = function( plays ) {
        plays.forEach( (function( play ) {
            if ( typeof play.wordPoints === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.wordPoints undefined' );
			play.turnPoints = play.wordPoints;
		}).bind( this ));
	}
}

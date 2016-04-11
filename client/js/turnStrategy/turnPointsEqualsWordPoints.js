'use strict';

function TurnPointsEqualsWordPointsStrategy() {
	this.execute = function( plays ) {
        plays.forEach( (function( play ) {
            if ( typeof play.wordPoints === 'undefined' ) throw new Error( this.constructor.name + '.execute(play) play.wordPoints undefined' );
			play.turnPoints = play.wordPoints;
		}).bind( this ));
	}
}

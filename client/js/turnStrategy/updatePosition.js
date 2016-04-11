'use strict';

function UpdatePositionStrategy() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.INFO );

	this.calculateScore = function( plays ) {
		plays.forEach( (function( play ) {
            if ( typeof play.startPosition === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.startPosition undefined' );

            switch ( play.playType ) {
                case 'move':
                    play.endPosition = play.endWordPosition;
                    break;
                case 'attack':
                    play.endPosition = play.startPosition;
                    break;
            }
        }).bind( this ));    
    }
}

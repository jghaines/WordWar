'use strict';

// if the endTurnScore drops below the given lowWaterMark, the player has lost
function LowWaterMarkLoserStrategy( lowWaterMark ) {
	this.calculateScore = function( plays ) {
 		plays.forEach( (function( play ) {
            play.lost = (
                typeof play.endTurnScore === 'number' && 
                play.endTurnScore < this._lowWaterMark
            );
		}).bind( this ));
	}
    
    if ( typeof lowWaterMark === 'undefined' ) throw new Error( this.constructor.name + '() expected lowWaterMark parameter' );
    this._lowWaterMark = lowWaterMark;
}

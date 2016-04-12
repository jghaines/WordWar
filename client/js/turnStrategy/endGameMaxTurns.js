'use strict';

// once the game reaches ( maxTurns -1 ), end the game with the max score winning
function EndGameMaxTurnsStrategy( maxTurns ) {
	this.execute = function( plays ) {
        if ( plays[0].turnIndex < ( this._maxTurns -1 ) ) {
            return; // not yet
        }
        var highScore = plays.reduce( ( prev, play ) => Math.max( prev, play.endTurnScore ), Number.MIN_SAFE_INTEGER);
        plays.forEach( play => {
            play.lost = ( play.endTurnScore < highScore );
        });
	}
    
    if ( typeof maxTurns !== 'number' ) throw new Error( this.constructor.name + '() expected maxTurns number parameter' );
    this._maxTurns = maxTurns;
}

'use strict';

// calculateScore(plays) returns whether the plays match the given specified playType combination 
// new PlayCombination( [ 'attack', 'move' ] )
function PlayTypeCombinationConditionalStrategy( playTypeList ) {
	this.calculateScore = function( plays ) {
        if ( plays.length !== 2 ) throw new Error( this.constructor.name + '.calculateScore() expected an array length 2 for plays' );
        return ( 
            plays[0].playType + '.' + plays[1].playType === this._playCombination ||
            plays[1].playType + '.' + plays[0].playType === this._playCombination );
    }

    if ( ! Array.isArray( playTypeList )) throw new Error( this.constructor.name + '() expected an array for playTypeList' );
    if ( playTypeList.length !== 2 ) throw new Error( this.constructor.name + '() expected an array length 2 for playTypeList' );
                    
    this._playCombination = playTypeList.join( '.' ); 
}

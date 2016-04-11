'use strict';

function ApplyAttackMulitiplierStrategy() {
	this.calculateScore = function( plays ) {
		plays.forEach( (function( play, i ) {
            if ( typeof play.playType === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].playType undefined' );
            if ( typeof play.turnPoints === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].turnPoints undefined' );
            if ( typeof play.startAttackMultiplier === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].startAttackMultiplier undefined' );

            if ( play.playType === 'attack' ) {
			    play.turnPoints *= play.startAttackMultiplier;
            }
		}).bind( this ));
    }
}

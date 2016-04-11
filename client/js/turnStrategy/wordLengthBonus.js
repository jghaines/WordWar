'use strict';

function WordLengthBonusStrategy( bonuses ) {
	this._bonusForWordLength = function( wordLength ) {
		for ( var i = this._bonuses.length - 1; i >= 0; --i ) {
			if ( this._bonuses[i].from <= wordLength && wordLength <= this._bonuses[i].to ) {
				return this._bonuses[i].bonus;
			}
		}
		return 0;
	}

	this.execute = function( plays ) {
		plays.forEach( (function( play ) {
            if ( typeof play.turnPoints === 'undefined' ) throw new Error( this.constructor.name + '.execute(play) play.turnPoints undefined' );
            if ( typeof play.word === 'undefined' ) throw new Error( this.constructor.name + '.execute(play) play.word undefined' );

			play.turnPoints += this._bonusForWordLength( play.word.length );
		}).bind( this ));
	}

	this._bonuses = bonuses;
}

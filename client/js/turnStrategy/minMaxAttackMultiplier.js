'use strict';

// enforce given min- and max-Value
function MinMaxAttackMultiplierStrategy( minValue, maxValue ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.calculateScore = function( plays ) {
		plays.forEach( (function( play ) {
            if ( typeof play.endAttackMultiplier === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.endAttackMultiplier undefined' );

			if ( play.endAttackMultiplier > this._maxValue ) {
				play.endAttackMultiplier = this._maxValue;
			} else if ( play.endAttackMultiplier < this._minValue ) {
				play.endAttackMultiplier = this._minValue;
			}
		}).bind( this ));
	}

	this._minValue = minValue;
	this._maxValue = maxValue;
}

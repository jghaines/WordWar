'use strict';

// enforce minimum maximum total score
function MinMaxEndTurnStrategy( minValue, maxValue ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	this.execute = function( plays ) {
        this.log.info( this.constructor.name + '.execute()' );
		plays.forEach( (function( play ) {
            if ( typeof play.endTurnScore === 'undefined' ) throw new Error( this.constructor.name + '.execute(play) play.endTurnScore undefined' );

			if ( play.endTurnScore > this._maxValue ) {
				play.endTurnScore = this._maxValue;
			} else if ( play.endTurnScore < this._minValue ) {
				play.endTurnScore = this._minValue;
			}
		}).bind( this ));
	}

	this._minValue = minValue;
	this._maxValue = maxValue;
}

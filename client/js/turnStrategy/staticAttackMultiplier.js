'use strict';

// each play will use the same attackMultiplier
function StaticAttackMultiplierStrategy( attackMultiplier ) {
	this.execute = function( plays ) {
 		plays.forEach( (function( play, i ) {
			play.startAttackMultiplier = play.endAttackMultiplier   = this._attackMultiplier;
		}).bind(this) );
	}

	this._attackMultiplier = attackMultiplier;
}

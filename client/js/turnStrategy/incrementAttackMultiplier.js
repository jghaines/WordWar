'use strict';

// updates the attackMultiplier based on playType and increment settings
function IncrementAttackMultiplierStrategy( incrementAfterMove, incrementAfterAttack ) {
	this.execute = function( plays ) {
		plays.forEach( (function( play ) {
            if ( typeof play.playType === 'undefined' ) throw new Error( this.constructor.name + '.execute(play) play.playType undefined' );
            if ( typeof play.startAttackMultiplier === 'undefined' ) throw new Error( this.constructor.name + '.execute(play) play.startAttackMultiplier undefined' );

			if ( 'attack' === play.playType) {
				play.endAttackMultiplier = play.startAttackMultiplier + this._incrementAfterAttack;
			} else if ( 'move' === play.playType ) {
				play.endAttackMultiplier = play.startAttackMultiplier + this._incrementAfterMove;
			}
		}).bind( this ));
	}

    if ( typeof incrementAfterMove !== 'number' ) throw new Error( this.constructor.name + '.() expected numeric incrementAfterMove parameter' );
    if ( typeof incrementAfterAttack !== 'number' ) throw new Error( this.constructor.name + '.() expected numeric incrementAfterAttack parameter' );

	this._incrementAfterMove = incrementAfterMove;
	this._incrementAfterAttack = incrementAfterAttack;
}

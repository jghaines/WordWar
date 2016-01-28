'use strict';

// attack is in-range if the last letter is within 'attackRange' cells of the opponent
function StaticDistanceAttackRangeStrategy( attackRange ) {
	this.isAttackInRange = function( fromCoordinates, toCoordinates, range ) {
		var attackCoord = {};
		if ( fromCoordinates.distanceTo( range.min ) < 1.5 ) {
			attackCoord = range.max;
		} else if ( fromCoordinates.distanceTo( range.max ) < 1.5 ) {
			attackCoord = range.min;
		} else {
			throw new Error( this.constructor.name + '.isAttackInRange() could not find end of range' );
		}

		return ( toCoordinates.distanceTo( attackCoord ) <= this._attackRange );
 	}

 	this._attackRange = attackRange;
 }

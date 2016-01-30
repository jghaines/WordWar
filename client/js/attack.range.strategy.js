'use strict';

// attack is in-range if it overlaps the opponent cell
function OverlappingAttackRangeStrategy() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.isAttackInRange = function( fromCoordinates, toCoordinates, range ) {
		this.log.info( this.constructor.name + '.isAttackInRange(..)');

		var inRange = false;
		range.foreach( function( coord ) {
			if ( coord.equals( toCoordinates )) {
				inRange = true;
			}
		});
		return inRange;
	}
}


// attack is in-range if the last letter is within 'attackRange' cells of the opponent
function RadiusAttackRangeStrategy( attackRange ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.isAttackInRange = function( fromCoordinates, toCoordinates, range ) {
		this.log.info( this.constructor.name + '.isAttackInRange(..)');

		var attackCoord = {};
		if ( fromCoordinates.distanceTo( range.min ) < 1.5 ) { // range.max is at the end of the range
			attackCoord = range.max;
		} else if ( fromCoordinates.distanceTo( range.max ) < 1.5 ) { // range.max is at the end of the range
			attackCoord = range.min;
		} else {
			throw new Error( this.constructor.name + '.isAttackInRange() could not find end of range' );
		}
		this.log.debug( this.constructor.name + '.isAttackInRange() - toCoordinates=', toCoordinates, 'attackCoord=', attackCoord );

		return ( toCoordinates.distanceTo( attackCoord ) <= this._attackRange );
 	}

 	if ( typeof attackRange !== 'number' ) {
 		throw new Error( this.constructor.name + '() expected Integer parameter' );
 	}
 	this._attackRange = attackRange;
}


// Composite pattern for AttackRange strategy
// constructor parameters:
// [ {
// 		from: 		3, // word lengths when strategy applies
// 		to: 		99,
// 		strategy: 	new OverlappingAttackRangeStrategy() // which strategy to apply
// 	}, ... ] );
function CompositeAttackRangeStrategy( composites ) {
	this.isAttackInRange = function( fromCoordinates, toCoordinates, range ) {
		var wordLength = range.count();

		for ( var i = this._composites.length - 1; i >= 0; --i ) {
			if ( composites[i].from <= wordLength && wordLength <= composites[i].to ) {
				if ( composites[i].strategy.isAttackInRange( fromCoordinates, toCoordinates, range )) {
					return true;
				}
			}
		}
		return false;
	}

	this._composites = composites;
 }

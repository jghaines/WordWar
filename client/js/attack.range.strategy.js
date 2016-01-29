'use strict';

// attack is in-range if the last letter is within 'attackRange' cells of the opponent
function StaticDistanceAttackRangeStrategy( attackRange ) {
	this.isAttackInRange = function( fromCoordinates, toCoordinates, range ) {
		var attackCoord = {};
		if ( fromCoordinates.distanceTo( range.min ) < 1.5 ) { // range.max is at the end of the range
			attackCoord = range.max;
		} else if ( fromCoordinates.distanceTo( range.max ) < 1.5 ) { // range.max is at the end of the range
			attackCoord = range.min;
		} else {
			throw new Error( this.constructor.name + '.isAttackInRange() could not find end of range' );
		}

		return ( toCoordinates.distanceTo( attackCoord ) <= this._attackRange );
 	}

 	if ( typeof attackRange !== 'number' ) {
 		throw new Error( this.constructor.name + '() expected Integer parameter' );
 	}
 	this._attackRange = attackRange;
 }


// attack is in-range if it overlaps the opponent cell
function OverlappingAttackRangeStrategy( attackRange ) {
	this.isAttackInRange = function( fromCoordinates, toCoordinates, range ) {
		var inRange = false;
		range.foreach( function( coord ) {
			if ( coord.equals( toCoordinates )) {
				inRange = true;
			}
		});
		return inRange;
	}
 }


// Composite 
function CompositeAttackRangeStrategy( composites ) {
	this.truncateRange = function( fromCoordinates, range, count ) {
		if ( range.min.row == range.max.row ) { // horizontal
			if ( fromCoordinates.col < range.min.col ) {
				return new CoordRange( new Coordinates( range.min.row, range.max.col - count + 1 ), range.max );
			} else if ( fromCoordinates.col > range.max.col ) {
				return new CoordRange( range.min, new Coordinates( range.max.row, range.min.col + count - 1 ) );
			} else {
				throw new Error( this.constructor.name + '.truncateRange() unhandled horizontal case' )
			}
		} else if ( range.min.col == range.max.col ) { // vertical
			if ( fromCoordinates.row < range.min.row ) {
				return new CoordRange( new Coordinates( range.max.row - count + 1, range.min.col ), range.max );
			} else if ( fromCoordinates.row > range.max.row ) {
				return new CoordRange( range.min, new Coordinates( range.min.row, range.min.col + count - 1 ) );
			} else {
				throw new Error( this.constructor.name + '.truncateRange() unhandled vertical case' )
			}
		} else {
			throw new Error( this.constructor.name + '.truncateRange() unhandled case' )
		}
	}

	this.isAttackInRange = function( fromCoordinates, toCoordinates, range ) {
		var wordLength = range.count();

		for ( var i = this._composites.length - 1; i >= 0; --i ) {
			if ( composites[i].fromLength >= wordLength ) {
				return composites[i].strategy.isAttackInRange( fromCoordinates, toCoordinates, 
					this.truncateRange( fromCoordinates, range, wordLength - composites[i].fromLength ));
			}
		}
		return false;
	}

	this._composites = composites;
 }
 
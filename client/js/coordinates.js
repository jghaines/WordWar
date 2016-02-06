'use strict';

function Coordinates( _row, _col ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.loadFromJson = function( json ) {
		this.row = json.row;
		this.col = json.col;
	}

	this.toJSON = function() {
		return {
			row: this.row,
		 	col: this.col
		 };
	}

	this.getIncrement = function( rowIncrement, colIncrement ) {
		return new Coordinates( this.row + rowIncrement, this.col + colIncrement );
	}

	this.getRotated = function( outerRange ) {
		if ( outerRange === undefined ) {
			throw new Error( this.constructor.name + ".getRotated() Expected outerRange parameter" );
		} else if ( outerRange.constructor.name != 'CoordRange' ) {
			throw new Error( this.constructor.name + ".getRotated() Expected outerRange of type CoordRange" );
		}

 		return new Coordinates (
 			( outerRange.max.row + outerRange.min.row - this.row ),
 			( outerRange.max.col + outerRange.min.col - this.col )
 		);
	}

	this.equals = function( other ) {
		return ( this.row == other.row && this.col == other.col );
	}

	// return the distance from this coordinate to other
	this.distanceTo = function( other ) {
		this.log.info( this.constructor.name + '.distanceTo(.)' );
		return	Math.sqrt(
					Math.pow( this.row - other.row, 2 ) + 
					Math.pow( this.col - other.col, 2 ) );
	}

	// constructor code
	this.row = _row;
	this.col = _col;
}

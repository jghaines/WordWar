'use strict';

function CoordRange( _min, _max ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.loadFromJson = function( json ) {
		this.min = new Coordinates();
		this.max = new Coordinates();

		if ( json.min ) this.min.loadFromJson( json.min );
		if ( json.max ) this.max.loadFromJson( json.max );
	}

	this.toJSON = function() {
		return {
			min: this.min.toJSON(),
			max: this.max.toJSON()
		};
	}

	this.count = function() {
		return ( this.max.row - this.min.row + 1 ) * ( this.max.col - this.min.col + 1 );
	}

	this.equals = function( other ) {
		return ( this.min.equals( other.min ) && this.max.equals( other.max ) );
	}

	this.getRotated = function( outerRange ) {
		return new CoordRange( this.max.getRotated( outerRange ), this.min.getRotated( outerRange ) );
	}

	this.foreach = function( callback ) {
		this.log.info( this.constructor.name + '.foreach(.)');

		for ( var row = this.min.row; row <= this.max.row ; ++row ) {
			for ( var col = this.min.col; col <= this.max.col ; ++col ) {
				callback( new Coordinates( row, col ));
			}			
		}
	}

    this.min = null;
    this.max = null;

	if ( typeof _min !== 'undefined' ) {
		if ( _min.constructor.name != 'Coordinates' ) {
			throw new Error( this.constructor.name + '() expected Coordinates min parameter' );
		}
		this.min = _min;
    }
	if ( typeof _max !== 'undefined' ) {
		if ( _max.constructor.name != 'Coordinates' ) {
			throw new Error( this.constructor.name + '() expected Coordinates max parameter' );
		}
		this.max = _max;
    }
}

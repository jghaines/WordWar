function Coordinates( _row, _col ) {


	this.equals = function( other ) {
		return ( this.row == other.row && this.col == other.col );
	}

	this.row = _row;
	this.col = _col;
}

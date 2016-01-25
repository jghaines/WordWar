function Coordinates( _row, _col ) {


	function equals( other ) {
		return ( this.row == other.row && this.col == other.col );
	}

	this.row = _row;
	this.col = _col;
}

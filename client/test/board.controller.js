describe('BoardController', function() {
	beforeEach(	function() {
		this.testTables = {
			'startPosition': $( `
<table><tbody>
	<tr> <td class='test-top-left'></td><td></td><td></td><td></td><td class='player-1'></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td class="test-middle"></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td class='player-0'></td><td></td><td></td><td></td><td class='test-bottom-right'></td> </tr>
</tbody></table>
`),			
			'firstLetter': $( `
<table><tbody>
	<tr> <td class='test-top-left'></td><td></td><td></td><td></td><td class='player-1'></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td class="test-middle"></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td class='player-0'></td><td class='placed'>A</td><td></td><td></td><td class='test-bottom-right'></td> </tr>
</tbody></table>
`),
			'skipStatic': $( `
<table><tbody>
	<tr> <td class='test-top-left'></td><td></td><td></td><td></td><td class='player-1'></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td class="test-middle"></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td class='player-0'></td><td class='placed'>A</td><td class='static'>P</td><td></td><td class='test-bottom-right'></td> </tr>
</tbody></table>
`),
			'fullRow': $( `
<table><tbody>
	<tr> <td class='test-top-left'></td><td></td><td></td><td></td><td class='player-1'></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td class="test-middle"></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td class='player-0'></td><td class='placed'>A</td><td class='static'>P</td><td class='placed'>P</td><td class='placed'>L</td> </tr>
</tbody></table>
`),
			'block': $( `
<table><tbody>
	<tr> <td class='test-top-left'></td><td></td><td></td><td></td><td class='player-1'></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td class="test-middle"></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td class='player-0'></td><td class='placed'>A</td><td class='block'></td><td></td><td class='test-bottom-right'></td> </tr>
</tbody></table>
`),
			'overlappingPlayers': $( `
<table><tbody>
	<tr> <td class='test-top-left'></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td class="player-0 player-1"></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td class='placed'>A</td><td class='block'></td><td></td><td class='test-bottom-right'></td> </tr>
</tbody></table>
`),
		};

		this.testDirection = {
			'startPosition' : 'any',
			'firstLetter' 	: 'right',
			'skipStatic' 	: 'right',
			'fullRow'	 	: 'right',
			'block'	 		: 'right',
		}

		this._boardModel = new BoardModel();
		this._boardView = new BoardView( this._boardModel );
        this._playEmitter = jasmine.createSpyObj('playEmitter', ['on']);
		this._boardController = new BoardController( this._boardModel, this._boardView, this._playEmitter );

	});

	describe( '#highlightPlaceablePositions()', function () {
		it( 'from the start position, it should highlight two adjacent cells', function() {
			this._boardModel._table 			= this.testTables['startPosition'];
			this._boardModel._placedDirection 	= this.testDirection['startPosition'];

			this._boardController.highlightPlaceablePositions( 0 );
			var cells = this._boardModel._table.find( 'td.placeable' );
			expect( cells.length ).toEqual( 2 );
			expect( this._boardModel.getCoordinatesForCell( $( cells[0] )).row ).toEqual( 4 );
			expect( this._boardModel.getCoordinatesForCell( $( cells[0] )).col ).toEqual( 0 );
			expect( this._boardModel.getCoordinatesForCell( $( cells[1] )).row ).toEqual( 5 );
			expect( this._boardModel.getCoordinatesForCell( $( cells[1] )).col ).toEqual( 1 );
		});

		it( 'should highlight only the next cell, when a single letter is placed', function() {
			this._boardModel._table 			= this.testTables['firstLetter'];
			this._boardModel._placedDirection 	= this.testDirection['firstLetter'];

			this._boardController.highlightPlaceablePositions( 0 );
			var cells = this._boardModel._table.find( 'td.placeable' );
			expect( cells.length ).toEqual( 1 );
			expect( this._boardModel.getCoordinatesForCell( $( cells[0] )).row ).toEqual( 5 );
			expect( this._boardModel.getCoordinatesForCell( $( cells[0] )).col ).toEqual( 2 );
		});

		it( 'should skip over static letters', function() {
			this._boardModel._table 			= this.testTables['skipStatic'];
			this._boardModel._placedDirection 	= this.testDirection['skipStatic'];

			this._boardController.highlightPlaceablePositions( 0 );
			var cells = this._boardModel._table.find( 'td.placeable' );
			expect( cells.length ).toEqual( 1 );
			expect( this._boardModel.getCoordinatesForCell( $( cells[0] )).row ).toEqual( 5 );
			expect( this._boardModel.getCoordinatesForCell( $( cells[0] )).col ).toEqual( 3 );
		});

		it( 'should highlight nothing on a full row', function() {
			this._boardModel._table 			= this.testTables['fullRow'];
			this._boardModel._placedDirection 	= this.testDirection['fullRow'];

			this._boardController.highlightPlaceablePositions( 0 );
			var cells = this._boardModel._table.find( 'td.placeable' );
			expect( cells.length ).toEqual( 0 );
		});

		it( 'should stop when there is a block', function() {
			this._boardModel._table 			= this.testTables['block'];
			this._boardModel._placedDirection 	= this.testDirection['block'];

			this._boardController.highlightPlaceablePositions( 0 );
			var cells = this._boardModel._table.find( 'td.placeable' );
			expect( cells.length ).toEqual( 0 );
		});
	});
});

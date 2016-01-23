

var expect = chai.expect;

describe('BoardController', function() {
	beforeEach(	function() {
		this.testTables = {
			'startPosition': $( `
<table><tbody>
	<tr> <td class='test-top-left'></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td class="test-middle"></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td class='player-local'></td><td></td><td></td><td></td><td class='test-bottom-right'></td> </tr>
</tbody></table>
`)
		};

		this._boardModel = new BoardModel();
		this._boardView = new BoardView( this._boardModel );
		this._boardController = new BoardController( this._boardModel, this._boardView );

	});

	describe( '#highlightPlaceablePositions()', function () {
		it( 'from the start position, it should highlight two cells', function() {
			this._boardModel._table = this.testTables['startPosition'];
			this._boardController.highlightPlaceablePositions();
			var cells = this._boardModel._table.find( 'td.placeable' );
			expect( cells.length ).to.equal( 2 );
			expect( this._boardModel.getCoordinatesForCell( $( cells[0] )).row ).to.equal( 4 );
			expect( this._boardModel.getCoordinatesForCell( $( cells[0] )).col ).to.equal( 0 );
			expect( this._boardModel.getCoordinatesForCell( $( cells[1] )).row ).to.equal( 5 );
			expect( this._boardModel.getCoordinatesForCell( $( cells[1] )).col ).to.equal( 1 );
		});
	});

});




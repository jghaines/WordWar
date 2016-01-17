var expect = chai.expect;

describe('BoardModel', function() {
	beforeEach(	function() {
		this._boardModel = new BoardModel();
		this._boardModel._table = $( `
<table><tbody>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td class="middle"></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
</tbody></table>
`);
	});

	describe('#getWidth()', function () {
		it('should 5 on our test board', function () {
			expect( this._boardModel.getWidth() ).to.equal( 5 );
		});
	});

	describe('#getHeight()', function () {
		it('should 6 on our test board', function () {
			expect( this._boardModel.getHeight() ).to.equal( 6 );
		});
	});

	describe('#getCellAtCoordinates()', function () {
		it('should throw an exception for call without object', function () {
			expect( function() { this._boardModel.getCellAtCoordinates( 0,0 ) } ).to.Throw( Error );
		});
	});

	describe('#getCellAtCoordinates()', function () {
		it('should return null for out of range', function () {
			expect( this._boardModel.getCellAtCoordinates( { row: -1, col:  0 } ) ).to.equal( null );
			expect( this._boardModel.getCellAtCoordinates( { row:  0, col: -1 } ) ).to.equal( null );
			expect( this._boardModel.getCellAtCoordinates( { row:  6, col:  0 } ) ).to.equal( null );
			expect( this._boardModel.getCellAtCoordinates( { row:  0, col:  5 } ) ).to.equal( null );
		});
	});

	describe('#getCellAtCoordinates()', function () {
		it('should return cell', function () {
			var cell = this._boardModel.getCellAtCoordinates( { row: 2, col: 2 } );
			expect( cell.hasClass('middle') ).to.equal( true );
		});
	});

});

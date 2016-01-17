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
		it('should return null for out of range', function () {
			expect( this._boardModel.getCellAtCoordinates( -1,0 ) ).to.equal( null );
		});
	});

});

describe('BoardModel', function() {	
	var xhr, requests;

	before(function () {
	    xhr = sinon.useFakeXMLHttpRequest();
	    requests = [];
	    xhr.onCreate = function (req) { requests.push(req); };
	});

	after(function () {
	    // Like before we must clean up when tampering with globals.
	    xhr.restore();
	});

	describe('loadBoard()', function () {
		it('should call load and do callback', function (done) {
			this._boardModel = new BoardModel();
			this._boardModel.onBoardLoaded( done );
			this._boardModel.loadBoard( 'dummyUrl');

			expect( requests.length ).to.equal( 1 ); // doesn't work
			expect( requests[0].url ).match( 'dummyUrl' ); //
		});
	});
/*
	after(function () {
		// When the test either fails or passes, restore the original
		// jQuery ajax function (Sinon.JS also provides tools to help
		// test frameworks automate clean-up like this)
		jQuery.ajax.restore();
	});
*/
});

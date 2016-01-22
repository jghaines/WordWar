

var expect = chai.expect;

describe('BoardController', function() {
	beforeEach(	function() {
		this._boardController = new BoardController();
		this._boardModel._table = $( `
<table><tbody>
	<tr> <td class='test-top-left'></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td class="test-middle"></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td></td><td></td><td></td><td></td><td></td> </tr>
	<tr> <td class='player-local'></td><td></td><td></td><td></td><td class='test-bottom-right'></td> </tr>
</tbody></table>
`);
	});

	describe('#highlightPlaceablePositions()', function () {
	});

});

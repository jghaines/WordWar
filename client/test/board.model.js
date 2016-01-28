var expect = chai.expect;
var assert = chai.assert;

describe('BoardModel', function() {
	beforeEach(	function() {
		this._boardModel = new BoardModel();
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
			expect( this._boardModel.getCellAtCoordinates( new Coordinates( -1,  0 ))).to.equal( null );
			expect( this._boardModel.getCellAtCoordinates( new Coordinates(  0, -1 ))).to.equal( null );
			expect( this._boardModel.getCellAtCoordinates( new Coordinates(  6,  0 ))).to.equal( null );
			expect( this._boardModel.getCellAtCoordinates( new Coordinates(  0,  5 ))).to.equal( null );
		});
	});

	describe('#getCellAtCoordinates()', function () {
		it('should return correct cell', function () {
			var cell = this._boardModel.getCellAtCoordinates( new Coordinates( 2, 2 ));
			expect( cell.hasClass('test-middle') ).to.equal( true );
		});
	});

	describe('#getCoordinatesForCell()', function () {
		it('should give correct coords', function () {
			var cell = this._boardModel.getCellAtCoordinates( new Coordinates( 2, 2 ));
			expect( this._boardModel.getCoordinatesForCell( cell ).row ).to.equal( 2 );
			expect( this._boardModel.getCoordinatesForCell( cell ).col ).to.equal( 2 );
		});
	});

	describe('#getPlayerCell("local")', function () {
		it('should return correct cell', function () {
			var cell = this._boardModel.getPlayerCell( 'local' );
			expect( cell.hasClass( 'player-local' ) ).to.equal( true );
			expect( cell.length ).to.equal( 1 );
		});
	});

	describe("#_getAllCellsInDirection(,'left')", function () {
		before( function() {
			this.fromCell  = this._boardModel.getPlayerCell('local');
			this.cells = this._boardModel._getAllCellsInDirection( this.fromCell, 'left' );
		});

		it('should return no cells', function () {
			expect( this.cells.length ).to.equal( 0 );
		});
	});

	describe("#_getAllCellsInDirection(,'right')", function () {
		before( function() {
			this.fromCell  = this._boardModel.getPlayerCell('local');
			this.cells = this._boardModel._getAllCellsInDirection( this.fromCell, 'right' );
		});

		it('should return 4 cells', function () {
			expect( this.cells.length ).to.equal( 4 );
		});

		it('should not contain the fromCell', function () {
			expect( this.cells.indexOf( this.fromCell ) ).to.equal( -1 );
		});
	});

	describe("#_getAllCellsInDirection(,'up')", function () {
		before( function() {
			this.fromCell  = this._boardModel.getPlayerCell('local');
			this.cells = this._boardModel._getAllCellsInDirection( this.fromCell, 'up' );
		});

		it('should return 5 cells', function () {
			expect( this.cells.length ).to.equal( 5 );
		});

		it('should not contain the fromCell', function () {
			expect( this.cells.indexOf( this.fromCell ) ).to.equal( -1 );
		});
		it('should end in the top left', function () {
			expect( this.cells[4].hasClass('test-top-left') ).to.equal( true );
		});
	});
});


describe('BoardModel wordcandidate - right', function() {
	beforeEach(	function() {
		this._boardModel = new BoardModel();
		this._boardView = new BoardView(this._boardModel);
		this._boardController = new BoardController(this._boardModel, this._boardView);

		this._boardModel._placedDirection = 'right';
		this.testTables = {
			noWord: $( `
				<table><tbody> <tr> <td class='player-local'></td><td></td><td></td><td></td><td></td> </tr> </tbody></table>
				`),
			onePlaced: $( `
				<table><tbody> <tr> <td class='player-local'></td><td class='placed'>A</td><td></td><td></td><td></td> </tr> </tbody></table>
				`),
			twoPlaced: $( `
				<table><tbody> <tr> <td class='player-local'></td><td class='placed'>A</td><td class='placed'>P</td><td></td><td></td> </tr> </tbody></table>
				`),
			oneStaticOnePlaced: $( `
				<table><tbody> <tr> <td class='player-local'></td><td class='static'>A</td><<td class='placed'>P</td><td></td><td></td> </tr> </tbody></table>
				`),
			onePlacedOneStatic: $( `
				<table><tbody> <tr> <td class='player-local'></td><td class='placed'>A</td><<td class='static'>P</td><td></td><td></td> </tr> </tbody></table>
				`),
			trailingStatic: $( `
				<table><tbody> <tr> <td class='player-local'></td><td class='placed'>A</td><<td class='static'>P</td><td></td><td class='static'>Z</td> </tr> </tbody></table>
				`),
			fullRow: $( `
				<table><tbody> <tr> <td class='player-local'></td><td class='placed'>A</td><<td class='static'>P</td><td class='static'>P</td><td class='static'>L</td> </tr> </tbody></table>
				`),
		};
	});

	describe('#_getWordCandidateCellsInDirection()', function () {
		it('should return no cells if nothing is placed', function () {
			this._boardModel._table = this.testTables['noWord'];
			var fromCell  = this._boardModel.getPlayerCell('local');
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'right' );
			expect( cells.length ).to.equal( 0 );
		});

		it('should return first cell for a one placed letter', function () {
			this._boardModel._table = this.testTables['onePlaced'];
			var fromCell  = this._boardModel.getPlayerCell('local');
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'right' );
			expect( cells.length ).to.equal( 1 );
			expect( cells[0].text() ).to.equal( 'A' );
		});

		it('should return first two cells for two placed letter', function () {
			this._boardModel._table = this.testTables['twoPlaced'];
			var fromCell  = this._boardModel.getPlayerCell('local');
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'right' );
			expect( cells.length ).to.equal( 2 );
			expect( cells[0].text() ).to.equal( 'A' );
			expect( cells[1].text() ).to.equal( 'P' );
		});

		it('should return first two cells for a one static, one placed word', function () {
			this._boardModel._table = this.testTables['oneStaticOnePlaced'];
			var fromCell  = this._boardModel.getPlayerCell('local');
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'right' );
			expect( cells.length ).to.equal( 2 );
			expect( cells[0].text() ).to.equal( 'A' );
			expect( cells[1].text() ).to.equal( 'P' );
		});

		it('should return all letters on a full row', function () {
			this._boardModel._table = this.testTables['fullRow'];
			var fromCell  = this._boardModel.getPlayerCell('local');
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'right' );
			expect( cells.length ).to.equal( 4 );
			expect( cells[0].text() ).to.equal( 'A' );
			expect( cells[1].text() ).to.equal( 'P' );
			expect( cells[2].text() ).to.equal( 'P' );
			expect( cells[3].text() ).to.equal( 'L' );
		});

		it('should return first two cells for a one placed, one static word', function () {
			this._boardModel._table = this.testTables['onePlacedOneStatic'];
			var fromCell  = this._boardModel.getPlayerCell('local');
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'right' );
			expect( cells.length ).to.equal( 2 );
			expect( cells[0].text() ).to.equal( 'A' );
			expect( cells[1].text() ).to.equal( 'P' );
		});

		it('should ignore trailing static cells', function () {
			this._boardModel._table = this.testTables['trailingStatic'];
			var fromCell  = this._boardModel.getPlayerCell('local');
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'right' );
			expect( cells.length ).to.equal( 2 );
			expect( cells[0].text() ).to.equal( 'A' );
			expect( cells[1].text() ).to.equal( 'P' );
		});
	});

	describe('#getPlayedWord()', function () {
		it('should return an empty string nothing is placed', function () {
			this._boardModel._table = this.testTables['noWord'];
			expect( this._boardModel.getPlayedWord() ).to.equal( '' );
		});

		it('should return first cell for a one placed letter', function () {
			this._boardModel._table = this.testTables['onePlaced'];
			expect( this._boardModel.getPlayedWord() ).to.equal( 'A' );
		});

		it('should return first two cells for two placed letter', function () {
			this._boardModel._table = this.testTables['twoPlaced'];
			expect( this._boardModel.getPlayedWord() ).to.equal( 'AP' );
		});

		it('should return first two cells for a one static, one placed word', function () {
			this._boardModel._table = this.testTables['oneStaticOnePlaced'];
			expect( this._boardModel.getPlayedWord() ).to.equal( 'AP' );
		});

		it('should return all letters on a full row', function () {
			this._boardModel._table = this.testTables['fullRow'];
			expect( this._boardModel.getPlayedWord() ).to.equal( 'APPL' );
		});

		it('should return first two cells for a one placed, one static word', function () {
			this._boardModel._table = this.testTables['onePlacedOneStatic'];
			expect( this._boardModel.getPlayedWord() ).to.equal( 'AP' );
		});

		it('should ignore trailing static cells', function () {
			this._boardModel._table = this.testTables['trailingStatic'];
			expect( this._boardModel.getPlayedWord() ).to.equal( 'AP' );
		});
	});
});

describe('BoardModel wordcandidate - up', function() {
	beforeEach(	function() {
		this._boardModel = new BoardModel();
		this._boardModel._placedDirection = 'up';
		this.testTables = {
			noWord: $( `
				<table><tbody> <tr><td /></tr> <tr><td /></tr> <tr><td class='player-local'></td></tr> </tbody></table>
				`),
			onePlaced: $( `
				<table><tbody> <tr><td /></tr> <tr><td /></tr> <tr><td class='placed'>A</td></tr> <tr><td class='player-local'></td></tr> </tbody></table>
				`),
			twoPlaced: $( `
				<table><tbody> <tr><td /></tr> <tr><td class='placed'>A</td></tr> <tr><td class='placed'>P</td></tr> <tr><td class='player-local'></td></tr> </tbody></table>
				`),
			oneStaticOnePlaced: $( `
				<table><tbody> <tr><td /></tr> <tr><td class='static'>A</td></tr> <tr><td class='placed'>P</td></tr> <tr><td class='player-local'></td></tr> </tbody></table>
				`),
			onePlacedOneStatic: $( `
				<table><tbody> <tr><td /></tr> <tr><td class='placed'>A</td></tr> <tr><td class='static'>P</td></tr> <tr><td class='player-local'></td></tr> </tbody></table>
				`),
			trailingStatic: $( `
				<table><tbody> <tr><td class='static'>Z</td></tr> <tr><td /></tr> <tr><td class='placed'>A</td></tr> <tr><td class='static'>P</td></tr> <tr><td class='player-local'></td></tr> </tbody></table>
				`),
			fullRow: $( `
				<table><tbody> <tr><td class='placed'>A</tr> <tr><td class='placed'>P</td></tr> <tr><td class='static'>E</td></tr> <tr><td class='player-local'></td></tr> </tbody></table>
				`),
		};
	});

	describe('#_getWordCandidateCellsInDirection()', function () {
		it('should return no cells if nothing is placed', function () {
			this._boardModel._table = this.testTables['noWord'];
			var fromCell  = this._boardModel.getPlayerCell('local');
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'up' );
			expect( cells.length ).to.equal( 0 );
		});

		it('should return first cell for a one placed letter', function () {
			this._boardModel._table = this.testTables['onePlaced'];
			var fromCell  = this._boardModel.getPlayerCell('local');
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'up' );
			expect( cells.length ).to.equal( 1 );
			expect( cells[0].text() ).to.equal( 'A' );
		});

		it('should return first two cells for two placed letter', function () {
			this._boardModel._table = this.testTables['twoPlaced'];
			var fromCell  = this._boardModel.getPlayerCell('local');
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'up' );
			expect( cells.length ).to.equal( 2 );
			expect( cells[0].text() ).to.equal( 'A' );
			expect( cells[1].text() ).to.equal( 'P' );
		});

		it('should return first two cells for a one static, one placed word', function () {
			this._boardModel._table = this.testTables['oneStaticOnePlaced'];
			var fromCell  = this._boardModel.getPlayerCell('local');
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'up' );
			expect( cells.length ).to.equal( 2 );
			expect( cells[0].text() ).to.equal( 'A' );
			expect( cells[1].text() ).to.equal( 'P' );
		});

		it('should return all letters on a full row', function () {
			this._boardModel._table = this.testTables['fullRow'];
			var fromCell  = this._boardModel.getPlayerCell('local');
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'up' );
			expect( cells.length ).to.equal( 3 );
			expect( cells[0].text() ).to.equal( 'A' );
			expect( cells[1].text() ).to.equal( 'P' );
			expect( cells[2].text() ).to.equal( 'E' );
		});

		it('should return first two cells for a one placed, one static word', function () {
			this._boardModel._table = this.testTables['onePlacedOneStatic'];
			var fromCell  = this._boardModel.getPlayerCell('local');
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'up' );
			expect( cells.length ).to.equal( 2 );
			expect( cells[0].text() ).to.equal( 'A' );
			expect( cells[1].text() ).to.equal( 'P' );
		});

		it('should ignore trailing static cells', function () {
			this._boardModel._table = this.testTables['trailingStatic'];
			var fromCell  = this._boardModel.getPlayerCell('local');
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'up' );
			expect( cells.length ).to.equal( 2 );
			expect( cells[0].text() ).to.equal( 'A' );
			expect( cells[1].text() ).to.equal( 'P' );
		});
	});

	describe('#getPlayedWord()', function () {
		it('should return an empty string nothing is placed', function () {
			this._boardModel._table = this.testTables['noWord'];
			expect( this._boardModel.getPlayedWord() ).to.equal( '' );
		});

		it('should return first cell for a one placed letter', function () {
			this._boardModel._table = this.testTables['onePlaced'];
			expect( this._boardModel.getPlayedWord() ).to.equal( 'A' );
		});

		it('should return first two cells for two placed letter', function () {
			this._boardModel._table = this.testTables['twoPlaced'];
			expect( this._boardModel.getPlayedWord() ).to.equal( 'AP' );
		});

		it('should return first two cells for a one static, one placed word', function () {
			this._boardModel._table = this.testTables['oneStaticOnePlaced'];
			expect( this._boardModel.getPlayedWord() ).to.equal( 'AP' );
		});

		it('should return all letters on a full row', function () {
			this._boardModel._table = this.testTables['fullRow'];
			expect( this._boardModel.getPlayedWord() ).to.equal( 'APE' );
		});

		it('should return first two cells for a one placed, one static word', function () {
			this._boardModel._table = this.testTables['onePlacedOneStatic'];
			expect( this._boardModel.getPlayedWord() ).to.equal( 'AP' );
		});

		it('should ignore trailing static cells', function () {
			this._boardModel._table = this.testTables['trailingStatic'];
			expect( this._boardModel.getPlayedWord() ).to.equal( 'AP' );
		});
	});
});

describe('BoardModel wordcandidate - left', function() {
	beforeEach(	function() {
		this._boardModel = new BoardModel();
		this._boardModel._placedDirection = 'left';
		this.testTables = {
			trailingStatic: $( `
				<table><tbody> <tr><td class='static'>Z</td> <td /> <td class='placed'>A</td> <td class='static'>P</td> <td class='player-local'></td></tr> </tbody></table>
				`),
		};
	});

	describe('#getPlayedWord()', function () {

		it('should ignore trailing static cells', function () {
			this._boardModel._table = this.testTables['trailingStatic'];
			expect( this._boardModel.getPlayedWord() ).to.equal( 'AP' );
		});
	});
});

describe('BoardModel wordcandidate - down', function() {
	beforeEach(	function() {
		this._boardModel = new BoardModel();
		this._boardModel._placedDirection = 'down';
		this.testTables = {
			trailingStatic: $( `
				<table><tbody> <tr><td class='player-local'></td></tr> <tr><td class='static'>A</td></tr> <tr><td class='placed'>P</td></tr> <tr><td /></tr> <tr><td class='static'>Z</td></tr> </tbody></table>
				`),
		};
	});

	describe('#getPlayedWord()', function () {

		it('should ignore trailing static cells', function () {
			this._boardModel._table = this.testTables['trailingStatic'];
			expect( this._boardModel.getPlayedWord() ).to.equal( 'AP' );
		});
	});
});

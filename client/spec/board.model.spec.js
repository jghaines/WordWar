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
	<tr> <td class='player-0'></td><td></td><td></td><td></td><td class='test-bottom-right'></td> </tr>
</tbody></table>
`);
	});

	describe('#getWidth()', function () {
		it('should 5 on our test board', function () {
			expect( this._boardModel.getWidth() ).toEqual( 5 );
		});
	});

	describe('#getHeight()', function () {
		it('should 6 on our test board', function () {
			expect( this._boardModel.getHeight() ).toEqual( 6 );
		});
	});

	describe('#getCellAtCoordinates()', function () {
		it('should throw an exception for call without object', function () {
			expect( function() { this._boardModel.getCellAtCoordinates( 0,0 ) } ).toThrow();
		});
	});

	describe('#getCellAtCoordinates()', function () {
		it('should return null for out of range', function () {
			expect( this._boardModel.getCellAtCoordinates( new Coordinates( -1,  0 ))).toEqual( null );
			expect( this._boardModel.getCellAtCoordinates( new Coordinates(  0, -1 ))).toEqual( null );
			expect( this._boardModel.getCellAtCoordinates( new Coordinates(  6,  0 ))).toEqual( null );
			expect( this._boardModel.getCellAtCoordinates( new Coordinates(  0,  5 ))).toEqual( null );
		});
	});

	describe('#getCellAtCoordinates()', function () {
		it('should return correct cell', function () {
			var cell = this._boardModel.getCellAtCoordinates( new Coordinates( 2, 2 ));
			expect( cell.hasClass('test-middle') ).toBe( true );
		});
	});

	describe('#getCoordinatesForCell()', function () {
		it('should give correct coords', function () {
			var cell = this._boardModel.getCellAtCoordinates( new Coordinates( 2, 2 ));
			expect( this._boardModel.getCoordinatesForCell( cell ).row ).toEqual( 2 );
			expect( this._boardModel.getCoordinatesForCell( cell ).col ).toEqual( 2 );
		});
	});

	describe('#getPlayerCell( 0 )', function () {
		it('should return correct cell', function () {
			var cell = this._boardModel.getPlayerCell( 0 );
			expect( cell.hasClass( 'player-0' ) ).toBe( true );
			expect( cell.length ).toEqual( 1 );
		});
	});

	describe("#_getAllCellsInDirection(,'left')", function () {
		beforeEach( function() {
			this.fromCell  = this._boardModel.getPlayerCell( 0 );
			this.cells = this._boardModel._getAllCellsInDirection( this.fromCell, 'left' );
		});

		it('should return no cells', function () {
			expect( this.cells.length ).toEqual( 0 );
		});
	});

	describe("#_getAllCellsInDirection(,'right')", function () {
		beforeEach( function() {
			this.fromCell  = this._boardModel.getPlayerCell( 0 );
			this.cells = this._boardModel._getAllCellsInDirection( this.fromCell, 'right' );
		});

		it('should return 4 cells', function () {
			expect( this.cells.length ).toEqual( 4 );
		});

		it('should not contain the fromCell', function () {
			expect( this.cells.indexOf( this.fromCell ) ).toEqual( -1 );
		});
	});

	describe("#_getAllCellsInDirection(,'up')", function () {
		beforeEach( function() {
			this.fromCell  = this._boardModel.getPlayerCell( 0 );
			this.cells = this._boardModel._getAllCellsInDirection( this.fromCell, 'up' );
		});

		it('should return 5 cells', function () {
			expect( this.cells.length ).toEqual( 5 );
		});

		it('should not contain the fromCell', function () {
			expect( this.cells.indexOf( this.fromCell ) ).toEqual( -1 );
		});
		it('should end in the top left', function () {
			expect( this.cells[4].hasClass('test-top-left') ).toBe( true );
		});
	});
});


describe('BoardModel wordcandidate - right', function() {
	beforeEach(	function() {
		this._boardModel = new BoardModel();
		this._boardView = new BoardView(this._boardModel);
        this._playEmitter = jasmine.createSpyObj('playEmitter', ['on']);
		this._boardController = new BoardController(this._boardModel, this._boardView, this._playEmitter);

		this._boardModel._placedDirection = 'right';
		this.testTables = {
			noWord: $( `
				<table><tbody> <tr> <td class='player-0'></td><td></td><td></td><td></td><td></td> </tr> </tbody></table>
				`),
			onePlaced: $( `
				<table><tbody> <tr> <td class='player-0'></td><td class='placed'>A</td><td></td><td></td><td></td> </tr> </tbody></table>
				`),
			twoPlaced: $( `
				<table><tbody> <tr> <td class='player-0'></td><td class='placed'>A</td><td class='placed'>P</td><td></td><td></td> </tr> </tbody></table>
				`),
			oneStaticOnePlaced: $( `
				<table><tbody> <tr> <td class='player-0'></td><td class='static'>A</td><<td class='placed'>P</td><td></td><td></td> </tr> </tbody></table>
				`),
			onePlacedOneStatic: $( `
				<table><tbody> <tr> <td class='player-0'></td><td class='placed'>A</td><<td class='static'>P</td><td></td><td></td> </tr> </tbody></table>
				`),
			trailingStatic: $( `
				<table><tbody> <tr> <td class='player-0'></td><td class='placed'>A</td><<td class='static'>P</td><td></td><td class='static'>Z</td> </tr> </tbody></table>
				`),
			fullRow: $( `
				<table><tbody> <tr> <td class='player-0'></td><td class='placed'>A</td><<td class='static'>P</td><td class='static'>P</td><td class='static'>L</td> </tr> </tbody></table>
				`),
		};
	});

	describe('#_getWordCandidateCellsInDirection()', function () {
		it('should return no cells if nothing is placed', function () {
			this._boardModel._table = this.testTables['noWord'];
			var fromCell  = this._boardModel.getPlayerCell( 0 );
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'right' );
			expect( cells.length ).toEqual( 0 );
		});

		it('should return first cell for a one placed letter', function () {
			this._boardModel._table = this.testTables['onePlaced'];
			var fromCell  = this._boardModel.getPlayerCell( 0 );
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'right' );
			expect( cells.length ).toEqual( 1 );
			expect( cells[0].text() ).toEqual( 'A' );
		});

		it('should return first two cells for two placed letter', function () {
			this._boardModel._table = this.testTables['twoPlaced'];
			var fromCell  = this._boardModel.getPlayerCell( 0 );
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'right' );
			expect( cells.length ).toEqual( 2 );
			expect( cells[0].text() ).toEqual( 'A' );
			expect( cells[1].text() ).toEqual( 'P' );
		});

		it('should return first two cells for a one static, one placed word', function () {
			this._boardModel._table = this.testTables['oneStaticOnePlaced'];
			var fromCell  = this._boardModel.getPlayerCell( 0 );
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'right' );
			expect( cells.length ).toEqual( 2 );
			expect( cells[0].text() ).toEqual( 'A' );
			expect( cells[1].text() ).toEqual( 'P' );
		});

		it('should return all letters on a full row', function () {
			this._boardModel._table = this.testTables['fullRow'];
			var fromCell  = this._boardModel.getPlayerCell( 0 );
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'right' );
			expect( cells.length ).toEqual( 4 );
			expect( cells[0].text() ).toEqual( 'A' );
			expect( cells[1].text() ).toEqual( 'P' );
			expect( cells[2].text() ).toEqual( 'P' );
			expect( cells[3].text() ).toEqual( 'L' );
		});

		it('should return first two cells for a one placed, one static word', function () {
			this._boardModel._table = this.testTables['onePlacedOneStatic'];
			var fromCell  = this._boardModel.getPlayerCell( 0 );
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'right' );
			expect( cells.length ).toEqual( 2 );
			expect( cells[0].text() ).toEqual( 'A' );
			expect( cells[1].text() ).toEqual( 'P' );
		});

		it('should ignore trailing static cells', function () {
			this._boardModel._table = this.testTables['trailingStatic'];
			var fromCell  = this._boardModel.getPlayerCell( 0 );
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'right' );
			expect( cells.length ).toEqual( 2 );
			expect( cells[0].text() ).toEqual( 'A' );
			expect( cells[1].text() ).toEqual( 'P' );
		});
	});

	describe('#getPlayedWord()', function () {
		it('should return an empty string nothing is placed', function () {
			this._boardModel._table = this.testTables['noWord'];
			expect( this._boardModel.getPlayedWord( 0 ) ).toEqual( '' );
		});

		it('should return first cell for a one placed letter', function () {
			this._boardModel._table = this.testTables['onePlaced'];
			expect( this._boardModel.getPlayedWord( 0 ) ).toEqual( 'A' );
		});

		it('should return first two cells for two placed letter', function () {
			this._boardModel._table = this.testTables['twoPlaced'];
			expect( this._boardModel.getPlayedWord( 0 ) ).toEqual( 'AP' );
		});

		it('should return first two cells for a one static, one placed word', function () {
			this._boardModel._table = this.testTables['oneStaticOnePlaced'];
			expect( this._boardModel.getPlayedWord( 0 ) ).toEqual( 'AP' );
		});

		it('should return all letters on a full row', function () {
			this._boardModel._table = this.testTables['fullRow'];
			expect( this._boardModel.getPlayedWord( 0 ) ).toEqual( 'APPL' );
		});

		it('should return first two cells for a one placed, one static word', function () {
			this._boardModel._table = this.testTables['onePlacedOneStatic'];
			expect( this._boardModel.getPlayedWord( 0 ) ).toEqual( 'AP' );
		});

		it('should ignore trailing static cells', function () {
			this._boardModel._table = this.testTables['trailingStatic'];
			expect( this._boardModel.getPlayedWord( 0 ) ).toEqual( 'AP' );
		});
	});
});

describe('BoardModel wordcandidate - up', function() {
	beforeEach(	function() {
		this._boardModel = new BoardModel();
		this._boardModel._placedDirection = 'up';
		this.testTables = {
			noWord: $( `
				<table><tbody> <tr><td /></tr> <tr><td /></tr> <tr><td class='player-0'></td></tr> </tbody></table>
				`),
			onePlaced: $( `
				<table><tbody> <tr><td /></tr> <tr><td /></tr> <tr><td class='placed'>A</td></tr> <tr><td class='player-0'></td></tr> </tbody></table>
				`),
			twoPlaced: $( `
				<table><tbody> <tr><td /></tr> <tr><td class='placed'>A</td></tr> <tr><td class='placed'>P</td></tr> <tr><td class='player-0'></td></tr> </tbody></table>
				`),
			oneStaticOnePlaced: $( `
				<table><tbody> <tr><td /></tr> <tr><td class='static'>A</td></tr> <tr><td class='placed'>P</td></tr> <tr><td class='player-0'></td></tr> </tbody></table>
				`),
			onePlacedOneStatic: $( `
				<table><tbody> <tr><td /></tr> <tr><td class='placed'>A</td></tr> <tr><td class='static'>P</td></tr> <tr><td class='player-0'></td></tr> </tbody></table>
				`),
			trailingStatic: $( `
				<table><tbody> <tr><td class='static'>Z</td></tr> <tr><td /></tr> <tr><td class='placed'>A</td></tr> <tr><td class='static'>P</td></tr> <tr><td class='player-0'></td></tr> </tbody></table>
				`),
			fullRow: $( `
				<table><tbody> <tr><td class='placed'>A</tr> <tr><td class='placed'>P</td></tr> <tr><td class='static'>E</td></tr> <tr><td class='player-0'></td></tr> </tbody></table>
				`),
		};
	});

	describe('#_getWordCandidateCellsInDirection()', function () {
		it('should return no cells if nothing is placed', function () {
			this._boardModel._table = this.testTables['noWord'];
			var fromCell  = this._boardModel.getPlayerCell( 0 );
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'up' );
			expect( cells.length ).toEqual( 0 );
		});

		it('should return first cell for a one placed letter', function () {
			this._boardModel._table = this.testTables['onePlaced'];
			var fromCell  = this._boardModel.getPlayerCell( 0 );
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'up' );
			expect( cells.length ).toEqual( 1 );
			expect( cells[0].text() ).toEqual( 'A' );
		});

		it('should return first two cells for two placed letter', function () {
			this._boardModel._table = this.testTables['twoPlaced'];
			var fromCell  = this._boardModel.getPlayerCell( 0 );
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'up' );
			expect( cells.length ).toEqual( 2 );
			expect( cells[0].text() ).toEqual( 'A' );
			expect( cells[1].text() ).toEqual( 'P' );
		});

		it('should return first two cells for a one static, one placed word', function () {
			this._boardModel._table = this.testTables['oneStaticOnePlaced'];
			var fromCell  = this._boardModel.getPlayerCell( 0 );
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'up' );
			expect( cells.length ).toEqual( 2 );
			expect( cells[0].text() ).toEqual( 'A' );
			expect( cells[1].text() ).toEqual( 'P' );
		});

		it('should return all letters on a full row', function () {
			this._boardModel._table = this.testTables['fullRow'];
			var fromCell  = this._boardModel.getPlayerCell( 0 );
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'up' );
			expect( cells.length ).toEqual( 3 );
			expect( cells[0].text() ).toEqual( 'A' );
			expect( cells[1].text() ).toEqual( 'P' );
			expect( cells[2].text() ).toEqual( 'E' );
		});

		it('should return first two cells for a one placed, one static word', function () {
			this._boardModel._table = this.testTables['onePlacedOneStatic'];
			var fromCell  = this._boardModel.getPlayerCell( 0 );
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'up' );
			expect( cells.length ).toEqual( 2 );
			expect( cells[0].text() ).toEqual( 'A' );
			expect( cells[1].text() ).toEqual( 'P' );
		});

		it('should ignore trailing static cells', function () {
			this._boardModel._table = this.testTables['trailingStatic'];
			var fromCell  = this._boardModel.getPlayerCell( 0 );
			var cells =  this._boardModel._getWordCandidateCellsInDirection( fromCell, 'up' );
			expect( cells.length ).toEqual( 2 );
			expect( cells[0].text() ).toEqual( 'A' );
			expect( cells[1].text() ).toEqual( 'P' );
		});
	});

	describe('#getPlayedWord()', function () {
		it('should return an empty string nothing is placed', function () {
			this._boardModel._table = this.testTables['noWord'];
			expect( this._boardModel.getPlayedWord( 0 ) ).toEqual( '' );
		});

		it('should return first cell for a one placed letter', function () {
			this._boardModel._table = this.testTables['onePlaced'];
			expect( this._boardModel.getPlayedWord( 0 ) ).toEqual( 'A' );
		});

		it('should return first two cells for two placed letter', function () {
			this._boardModel._table = this.testTables['twoPlaced'];
			expect( this._boardModel.getPlayedWord( 0 ) ).toEqual( 'AP' );
		});

		it('should return first two cells for a one static, one placed word', function () {
			this._boardModel._table = this.testTables['oneStaticOnePlaced'];
			expect( this._boardModel.getPlayedWord( 0 ) ).toEqual( 'AP' );
		});

		it('should return all letters on a full row', function () {
			this._boardModel._table = this.testTables['fullRow'];
			expect( this._boardModel.getPlayedWord( 0 ) ).toEqual( 'APE' );
		});

		it('should return first two cells for a one placed, one static word', function () {
			this._boardModel._table = this.testTables['onePlacedOneStatic'];
			expect( this._boardModel.getPlayedWord( 0 ) ).toEqual( 'AP' );
		});

		it('should ignore trailing static cells', function () {
			this._boardModel._table = this.testTables['trailingStatic'];
			expect( this._boardModel.getPlayedWord( 0 ) ).toEqual( 'AP' );
		});
	});
});

describe('BoardModel wordcandidate - left', function() {
	beforeEach(	function() {
		this._boardModel = new BoardModel();
		this._boardModel._placedDirection = 'left';
		this.testTables = {
			trailingStatic: $( `
				<table><tbody> <tr><td class='static'>Z</td> <td /> <td class='placed'>A</td> <td class='static'>P</td> <td class='player-0'></td></tr> </tbody></table>
				`),
		};
	});

	describe('#getPlayedWord()', function () {

		it('should ignore trailing static cells', function () {
			this._boardModel._table = this.testTables['trailingStatic'];
			expect( this._boardModel.getPlayedWord( 0 ) ).toEqual( 'AP' );
		});
	});
});

describe('BoardModel wordcandidate - down', function() {
	beforeEach(	function() {
		this._boardModel = new BoardModel();
		this._boardModel._placedDirection = 'down';
		this.testTables = {
			trailingStatic: $( `
				<table><tbody> <tr><td class='player-0'></td></tr> <tr><td class='static'>A</td></tr> <tr><td class='placed'>P</td></tr> <tr><td /></tr> <tr><td class='static'>Z</td></tr> </tbody></table>
				`),
		};
	});

	describe('#getPlayedWord()', function () {

		it('should ignore trailing static cells', function () {
			this._boardModel._table = this.testTables['trailingStatic'];
			expect( this._boardModel.getPlayedWord( 0 ) ).toEqual( 'AP' );
		});
	});
});

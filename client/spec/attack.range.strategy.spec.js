
// test the given strategy exhaustively over the board
function checkBoard( strategy, fromCoordinates, board, range ) {
	for ( var row = 0; row < board.length; ++row ) {
		var line = board[row];
		for ( var col = 0; col < line.length; ++col ) {
			var cell = line[col];
			var toCoordinates = new Coordinates( row, col );
			var expectedResult = ( cell == 'X' );
			expect( strategy.isAttackInRange( fromCoordinates, toCoordinates, range ) ).toBe( expectedResult,
				'row: ' + row + ' col: ' + col + ' should be ' + ( expectedResult ? 'in-' : 'out-of-' ) + 'range'  );
		}
	}
}

describe('AttackRangeStrategy classes', function() {
	beforeAll( function() {
		this.coordsNW = new Coordinates( 0, 0 );
		this.coordsSE = new Coordinates( 4, 4 );
		this.coordsNE = new Coordinates( 0, 4 );
		this.coordsSW = new Coordinates( 4, 0 );

		this.rangeTop    = new CoordRange( this.coordsNW, this.coordsNE );
		this.rangeLeft   = new CoordRange( this.coordsNW, this.coordsSW );
		this.rangeRight  = new CoordRange( this.coordsNE, this.coordsSE );
		this.rangeBottom = new CoordRange( this.coordsSW, this.coordsSE );
	});

	describe('RadiusAttackRangeStrategy', function() {
		beforeEach( function() {
			this.attackRange = new RadiusAttackRangeStrategy(2);
		});

		describe("#isAttackInRange() - left to right", function () {
			it("should throw an exception if not constructed with an integer", function() {
				expect( function() { new RadiusAttackRangeStrategy() } ).toThrowError( /expected/ );
			});

			it("should be in range for a NW to NE word", function() {
				var fromCoordinates = this.coordsNW;
				var toCoordinates = this.coordsNE;
				var range = new CoordRange( new Coordinates( 0, 1 ), this.coordsNE );
				expect( this.attackRange.isAttackInRange( fromCoordinates, toCoordinates, range )).toBe( true );
			});

			it("should be in range for one and two cells short", function() {
				var fromCoordinates = this.coordsNW;
				var toCoordinates = this.coordsNE;
				var range;
				range = new CoordRange( new Coordinates( 0, 1 ), new Coordinates( 0, 3 ));
				expect( this.attackRange.isAttackInRange( fromCoordinates, toCoordinates, range )).toBe( true );
				range = new CoordRange( new Coordinates( 0, 1 ), new Coordinates( 0, 2 ));
				expect( this.attackRange.isAttackInRange( fromCoordinates, toCoordinates, range )).toBe( true );
			});

			it("should not be in range for three cells short", function() {
				var fromCoordinates = this.coordsNW;
				var toCoordinates = this.coordsNE;
				var range = new CoordRange( new Coordinates( 0, 1 ), new Coordinates( 0, 1 ));
				expect( this.attackRange.isAttackInRange( fromCoordinates, toCoordinates, range )).toBe( false );
			});
		});

		describe("#isAttackInRange() - right to left", function () {

			it("should be in range for a NE to NW word", function() {
				var fromCoordinates = this.coordsNE;
				var toCoordinates = this.coordsNW;
				var range = new CoordRange( this.coordsNW, new Coordinates( 0, 3 ) );
				expect( this.attackRange.isAttackInRange( fromCoordinates, toCoordinates, range )).toBe( true );
			});

			it("should be in range for one and two cells short", function() {
				var fromCoordinates = this.coordsNE;
				var toCoordinates = this.coordsNW;
				var range;
				range = new CoordRange( new Coordinates( 0, 1 ), new Coordinates( 0, 3 ));
				expect( this.attackRange.isAttackInRange( fromCoordinates, toCoordinates, range )).toBe( true );
				range = new CoordRange( new Coordinates( 0, 2 ), new Coordinates( 0, 3 ));
				expect( this.attackRange.isAttackInRange( fromCoordinates, toCoordinates, range )).toBe( true );
			});

			it("should not be in range for three cells short", function() {
				var fromCoordinates = this.coordsNE;
				var toCoordinates = this.coordsNW;
				var range = new CoordRange( new Coordinates( 0, 3 ), new Coordinates( 0, 3 ));
				expect( this.attackRange.isAttackInRange( fromCoordinates, toCoordinates, range )).toBe( false );
			});
		});
	});

	describe('OverlappingAttackRangeStrategy', function() {
		beforeEach( function() {
			this.attackRange = new OverlappingAttackRangeStrategy();
		});


		describe("#isAttackInRange()", function () {
			it("should be in range for a NW to NE word", function() {
				var fromCoordinates = this.coordsNW;
				var toCoordinates = this.coordsNE;
				var range = new CoordRange( new Coordinates( 0, 1 ), this.coordsNE );
				expect( this.attackRange.isAttackInRange( fromCoordinates, toCoordinates, range )).toBe( true );
			});

			it("should be in range for multiple cell overlaps", function() {
				var fromCoordinates = this.coordsNW;
				var toCoordinates = new Coordinates( 0, 1 );
				var range;
				range = new CoordRange( new Coordinates( 0, 1 ), new Coordinates( 0, 3 ));
				expect( this.attackRange.isAttackInRange( fromCoordinates, toCoordinates, range )).toBe( true );
				range = new CoordRange( new Coordinates( 0, 1 ), new Coordinates( 0, 2 ));
				expect( this.attackRange.isAttackInRange( fromCoordinates, toCoordinates, range )).toBe( true );
				range = new CoordRange( new Coordinates( 0, 1 ), new Coordinates( 0, 1 ));
				expect( this.attackRange.isAttackInRange( fromCoordinates, toCoordinates, range )).toBe( true );
			});

			it("should NOT be in range for cells that fall short", function() {
				var fromCoordinates = this.coordsNW;
				var toCoordinates = this.coordsNE;
				var range;
				range = new CoordRange( new Coordinates( 0, 1 ), new Coordinates( 0, 3 ));
				expect( this.attackRange.isAttackInRange( fromCoordinates, toCoordinates, range )).toBe( false );
				range = new CoordRange( new Coordinates( 0, 1 ), new Coordinates( 0, 2 ));
				expect( this.attackRange.isAttackInRange( fromCoordinates, toCoordinates, range )).toBe( false );
				range = new CoordRange( new Coordinates( 0, 1 ), new Coordinates( 0, 1 ));
				expect( this.attackRange.isAttackInRange( fromCoordinates, toCoordinates, range )).toBe( false );
			});
		});
	});

	describe('CompositeAttackRangeStrategy', function() {
		beforeEach( function() {
			this.fromCoordinates = new Coordinates( 3, 0 );
			this.boards = { // for checkBoard function '_'=player, 'X'=in-range
				'blank': [
					'....................',
					'....................',
					'....................',
					'_...................',
					'....................',
					'....................',
					'....................',
				],
				'line1': [
					'....................',
					'....................',
					'....................',
					'_X..................',
					'....................',
					'....................',
					'....................',
				],
				'line2': [
					'....................',
					'....................',
					'....................',
					'_XX.................',
					'....................',
					'....................',
					'....................',
				],
				'line3': [
					'....................',
					'....................',
					'....................',
					'_XXX................',
					'....................',
					'....................',
					'....................',
				],
				'line4': [
					'....................',
					'....................',
					'....................',
					'_XXXX...............',
					'....................',
					'....................',
					'....................',
				],
				'line5': [
					'....................',
					'....................',
					'....................',
					'_XXXXX..............',
					'....................',
					'....................',
					'....................',
				],
				'line6+1' : [
					'....................',
					'....................',
					'......X.............',
					'_XXXXXXX............',
					'......X.............',
					'....................',
					'....................',
				],
				'line8+2' : [
					'....................',
					'........X...........',
					'.......XXX..........',
					'_XXXXXXXXXX.........',
					'.......XXX..........',
					'........X...........',
					'....................',
				],
				'line10+3' : [
					'..........X.........',
					'........XXXXX.......',
					'........XXXXX.......',
					'_XXXXXXXXXXXXX......',
					'........XXXXX.......',
					'........XXXXX.......',
					'..........X.........',
				]
			};
		});

		describe('multiple composite', function() {
			it('should invoke the component strategies in range exactly once', function () {
				var attackRangeStrategySpyA = jasmine.createSpyObj( 'attackRangeStrategyA', [ 'isAttackInRange' ]);
				var attackRangeStrategySpyB = jasmine.createSpyObj( 'attackRangeStrategyB', [ 'isAttackInRange' ]);

				this.attackRangeStrategy = new CompositeAttackRangeStrategy( [
					{
						from: 		1,
						to: 		99,
						strategy: 	attackRangeStrategySpyA
					},
					{
						from: 		6,
						to: 		7,
						strategy: 	attackRangeStrategySpyB
					},
				] );
				this.attackRangeStrategy.isAttackInRange( this.coordsNW, this.coordsNE, this.rangeTop );
				expect( attackRangeStrategySpyA.isAttackInRange.calls.count() ).toEqual( 1 );
				expect( attackRangeStrategySpyB.isAttackInRange.calls.count() ).toEqual( 0 );
			});
		});


		describe('basic composite', function() {
			beforeEach( function() {
				this.attackRange = new CompositeAttackRangeStrategy(
					[
						{
							from: 		3,
							to: 		99,
							strategy: 	new OverlappingAttackRangeStrategy()
						},
					] );
			});

			it('should return no hits for short lengths', function() {
				var range;
				range = new CoordRange( new Coordinates( 3, 1 ), new Coordinates( 3, 1 ) );
				checkBoard( this.attackRange, this.fromCoordinates, this.boards['blank'], range );

				range = new CoordRange( new Coordinates( 3, 1 ), new Coordinates( 3, 2 ) );
				checkBoard( this.attackRange, this.fromCoordinates, this.boards['blank'], range );
			});

			it('should return overlapping cells for lengths >= 3', function() {
				var range;
				range = new CoordRange( new Coordinates( 3, 1 ), new Coordinates( 3, 3 ) );
				checkBoard( this.attackRange, this.fromCoordinates, this.boards['line3'], range );
				range = new CoordRange( new Coordinates( 3, 1 ), new Coordinates( 3, 4 ) );
				checkBoard( this.attackRange, this.fromCoordinates, this.boards['line4'], range );
				range = new CoordRange( new Coordinates( 3, 1 ), new Coordinates( 3, 5 ) );
				checkBoard( this.attackRange, this.fromCoordinates, this.boards['line5'], range );
			});
		});

		describe('complex composite', function() {
			beforeEach( function() {
				this.attackRange = new CompositeAttackRangeStrategy( [
					{ from:  1, to: 99, strategy: new OverlappingAttackRangeStrategy() },
					{ from:  6, to:  7, strategy: new RadiusAttackRangeStrategy(1) },
					{ from:  8, to:  9, strategy: new RadiusAttackRangeStrategy(2) },
					{ from: 10, to: 99, strategy: new RadiusAttackRangeStrategy(3) },
				]);
			});

			it('should overlapping hits for short lengths', function() {
				var range;
				range = new CoordRange( new Coordinates( 3, 1 ), new Coordinates( 3, 1 ) );
				checkBoard( this.attackRange, this.fromCoordinates, this.boards['line1'], range );

				range = new CoordRange( new Coordinates( 3, 1 ), new Coordinates( 3, 2 ) );
				checkBoard( this.attackRange, this.fromCoordinates, this.boards['line2'], range );

				range = new CoordRange( new Coordinates( 3, 1 ), new Coordinates( 3, 3 ) );
				checkBoard( this.attackRange, this.fromCoordinates, this.boards['line3'], range );

				range = new CoordRange( new Coordinates( 3, 1 ), new Coordinates( 3, 4 ) );
				checkBoard( this.attackRange, this.fromCoordinates, this.boards['line4'], range );

				range = new CoordRange( new Coordinates( 3, 1 ), new Coordinates( 3, 4 ) );
				checkBoard( this.attackRange, this.fromCoordinates, this.boards['line4'], range );

				range = new CoordRange( new Coordinates( 3, 1 ), new Coordinates( 3, 5 ) );
				checkBoard( this.attackRange, this.fromCoordinates, this.boards['line5'], range );
			});

			it('should return overlapping cells and 1-radius cells for length 6', function() {
				var range;
				range = new CoordRange( new Coordinates( 3, 1 ), new Coordinates( 3, 6 ) );
				checkBoard( this.attackRange, this.fromCoordinates, this.boards['line6+1'], range );
			});

			it('should return overlapping cells and 2-radius cells for length 8', function() {
				var range;
				range = new CoordRange( new Coordinates( 3, 1 ), new Coordinates( 3, 8 ) );
				checkBoard( this.attackRange, this.fromCoordinates, this.boards['line8+2'], range );
			});

			it('should return overlapping cells and 3-radius cells for length 10', function() {
				var range;
				range = new CoordRange( new Coordinates( 3, 1 ), new Coordinates( 3, 10 ) );
				checkBoard( this.attackRange, this.fromCoordinates, this.boards['line10+3'], range );
			});
		});
	});
});

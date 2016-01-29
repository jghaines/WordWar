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

	describe('StaticDistanceAttackRangeStrategy', function() {
		beforeEach( function() {
			this.attackRange = new StaticDistanceAttackRangeStrategy(2);
		});

		describe("#isAttackInRange() - left to right", function () {
			it("should throw an exception if not constructed with an integer", function() {
				expect( function() { new StaticDistanceAttackRangeStrategy() } ).throw;
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
			this.attackRange = new CompositeAttackRangeStrategy(
				[
					{
						fromLength: 10,
						strategy: 	new StaticDistanceAttackRangeStrategy(3)
					},
					{
						fromLength: 8,
						strategy: 	new StaticDistanceAttackRangeStrategy(2)
					},
					{
						fromLength: 6,
						strategy: 	new StaticDistanceAttackRangeStrategy(1)
					},
					{
						fromLength: 1,
						strategy: 	new OverlappingAttackRangeStrategy()
					},
				] );
		});


		describe("#isAttackInRange()", function () {
			it("should be in range for a NW to NE word", function() {
				var fromCoordinates = this.coordsNW;
				var toCoordinates = this.coordsNE;
				var range = new CoordRange( new Coordinates( 0, 1 ), this.coordsNE );
				expect( this.attackRange.isAttackInRange( fromCoordinates, toCoordinates, range )).toBe( true );
			});

		});
	});
});




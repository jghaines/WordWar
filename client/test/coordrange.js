describe('CoordRange', function() {
	beforeEach( function() {
		this.coordsNW = new Coordinates( 0, 0 );
		this.coordsSE = new Coordinates( 4, 4 );
		this.coordsNE = new Coordinates( 0, 4 );
		this.coordsSW = new Coordinates( 4, 0 );
		this.outerRange = new CoordRange( this.coordsNW, this.coordsSE );

		this.rangeTop    = new CoordRange( this.coordsNW, this.coordsNE );
		this.rangeLeft   = new CoordRange( this.coordsNW, this.coordsSW );
		this.rangeRight  = new CoordRange( this.coordsNE, this.coordsSE );
		this.rangeBottom = new CoordRange( this.coordsSW, this.coordsSE );
	});

	describe("#count()", function () {
		it('should return 5 for the top', function () {
			expect( this.rangeTop.count() ).toEqual( 5 );
		});
		it('should return 5 for the left', function () {
			expect( this.rangeLeft.count() ).toEqual( 5 );
		});
		it('should return 5 for the right', function () {
			expect( this.rangeRight.count() ).toEqual( 5 );
		});
		it('should return 5 for the bottom', function () {
			expect( this.rangeBottom.count() ).toEqual( 5 );
		});
		it('should return 25 for the outerRange', function () {
			expect( this.outerRange.count() ).toEqual( 25 );
		});
	});

	describe("#getRotated()", function () {
		it('should rotate from left to right', function () {
			this.rotated = this.rangeLeft.getRotated( this.outerRange );
			expect( this.rotated.equals( this.rangeRight ) ).toEqual( true );
		});
		it('should rotate from right to left ', function () {
			this.rotated = this.rangeRight.getRotated( this.outerRange );
			expect( this.rotated.equals( this.rangeLeft ) ).toEqual( true );
		});
		it('should rotate from top to bottom', function () {
			this.rotated = this.rangeTop.getRotated( this.outerRange );
			expect( this.rotated.equals( this.rangeBottom ) ).toEqual( true );
		});
		it('should rotate from bottom to top', function () {
			this.rotated = this.rangeBottom.getRotated( this.outerRange );
			expect( this.rotated.equals( this.rangeTop ) ).toEqual( true );
		});
	});
});

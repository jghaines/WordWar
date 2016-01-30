describe('Coordinates', function() {

	describe("#distanceTo()", function () {
		it('return the exact horizontal distance', function () {
			this.coordsA = new Coordinates( 0, 0 );
			this.coordsB = new Coordinates( 0, 4 );
			expect( this.coordsA.distanceTo( this.coordsB )).toEqual( 4 );
			expect( this.coordsB.distanceTo( this.coordsA )).toEqual( 4 );
		});
		it('return the exact vertical distance', function () {
			this.coordsA = new Coordinates( 0, 0 );
			this.coordsB = new Coordinates( 4, 0 );
			expect( this.coordsA.distanceTo( this.coordsB )).toEqual( 4 );
			expect( this.coordsB.distanceTo( this.coordsA )).toEqual( 4 );
		});
		it('return the approximate diagonal', function () {
			this.coordsA = new Coordinates( 0, 0 );
			this.coordsB = new Coordinates( 2, 3 );
			expect( this.coordsA.distanceTo( this.coordsB )).toBeCloseTo( 3.6, 0.1 );
			expect( this.coordsB.distanceTo( this.coordsA )).toBeCloseTo( 3.6, 0.1 );
		});
	});

	describe("#getRotated()", function () {
		it('should rotate from near corner to far corner', function () {
			this.coordsA = new Coordinates( 0, 0 );
			this.coordsB = new Coordinates( 4, 4 );
			this.outerRange = new CoordRange( this.coordsA, this.coordsB );
			this.coordsRotated = this.coordsA.getRotated( this.outerRange );

			expect( this.coordsRotated.equals( this.coordsB ) ).toEqual( true );
		});
		it('should rotate from far corner to near corner', function () {
			this.coordsA = new Coordinates( 0, 0 );
			this.coordsB = new Coordinates( 4, 4 );
			this.outerRange = new CoordRange( this.coordsA, this.coordsB );
			this.coordsRotated = this.coordsB.getRotated( this.outerRange ); // note: B

			expect( this.coordsRotated.equals( this.coordsA ) ).toEqual( true );
		});
		it('should rotate around the middle', function () {
			this.coordsA = new Coordinates( 0, 0 );
			this.coordsB = new Coordinates( 10, 10 );
			this.coordsC = new Coordinates( 2, 3 );
			this.coordsD = new Coordinates( 8, 7 );
			this.outerRange = new CoordRange( this.coordsA, this.coordsB );
			this.coordsRotated = this.coordsC.getRotated( this.outerRange );

			expect( this.coordsRotated.equals( this.coordsD ) ).toEqual( true );
		});
		it('should rotate around offset outerRanges', function () {
			this.coordsA = new Coordinates( 10, 10 );
			this.coordsB = new Coordinates( 20, 20 );
			this.coordsC = new Coordinates( 12, 11 );
			this.coordsD = new Coordinates( 18, 19 );
			this.outerRange = new CoordRange( this.coordsA, this.coordsB );
			this.coordsRotated = this.coordsC.getRotated( this.outerRange );

			expect( this.coordsRotated.equals( this.coordsD ) ).toEqual( true );
		});
	});
});
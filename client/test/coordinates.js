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

	describe("#distanceToOrigin()", function () {
		it('return the exact horizontal distance', function () {
			this.coords = new Coordinates( 0, 4 );
			expect( this.coords.distanceToOrigin() ).toEqual( 4 );
		});
		it('return the exact vertical distance', function () {
			this.coords = new Coordinates( 4, 0 );
			expect( this.coords.distanceToOrigin() ).toEqual( 4 );
		});
		it('return the approximate diagonal', function () {
			this.coords = new Coordinates( 2, 3 );
			expect( this.coords.distanceToOrigin() ).toBeCloseTo( 3.6, 0.1 );
		});
	});

	describe("#getRotated()", function () {
		it('should rotate from near corner to far corner', function () {
			this.coordsA = new Coordinates( 0, 0 );
			this.coordsB = new Coordinates( 4, 4 );
			this.outerRange = new CoordRange( this.coordsA, this.coordsB );
			this.coordsRotated = this.coordsA.getRotated( this.outerRange );

			expect( this.coordsRotated.equals( this.coordsB ) ).toBe( true );
		});
		it('should rotate from far corner to near corner', function () {
			this.coordsA = new Coordinates( 0, 0 );
			this.coordsB = new Coordinates( 4, 4 );
			this.outerRange = new CoordRange( this.coordsA, this.coordsB );
			this.coordsRotated = this.coordsB.getRotated( this.outerRange ); // note: B

			expect( this.coordsRotated.equals( this.coordsA ) ).toBe( true );
		});
		it('should rotate around the middle', function () {
			this.coordsA = new Coordinates( 0, 0 );
			this.coordsB = new Coordinates( 10, 10 );
			this.coordsC = new Coordinates( 2, 3 );
			this.coordsD = new Coordinates( 8, 7 );
			this.outerRange = new CoordRange( this.coordsA, this.coordsB );
			this.coordsRotated = this.coordsC.getRotated( this.outerRange );

			expect( this.coordsRotated.equals( this.coordsD ) ).toBe( true );
		});
		it('should rotate around offset outerRanges', function () {
			this.coordsA = new Coordinates( 10, 10 );
			this.coordsB = new Coordinates( 20, 20 );
			this.coordsC = new Coordinates( 12, 11 );
			this.coordsD = new Coordinates( 18, 19 );
			this.outerRange = new CoordRange( this.coordsA, this.coordsB );
			this.coordsRotated = this.coordsC.getRotated( this.outerRange );

			expect( this.coordsRotated.equals( this.coordsD ) ).toBe( true );
		});
	});

	describe("#getIncrement()", function () {
		it('should shift up', function () {
			this.coordsA = new Coordinates( 5, 5 );
			this.coordsB = new Coordinates( 5, 4 );
			this.coordsIncr = this.coordsA.getIncrement( 0, -1 );

			expect( this.coordsIncr.equals( this.coordsB ) ).toBe( true );
		});
		it('should shift down', function () {
			this.coordsA = new Coordinates( 5, 5 );
			this.coordsB = new Coordinates( 5, 6 );
			this.coordsIncr = this.coordsA.getIncrement( 0, 1 );

			expect( this.coordsIncr.equals( this.coordsB ) ).toBe( true );
		});
		it('should shift left', function () {
			this.coordsA = new Coordinates( 5, 5 );
			this.coordsB = new Coordinates( 4, 5 );
			this.coordsIncr = this.coordsA.getIncrement( -1, 0 );

			expect( this.coordsIncr.equals( this.coordsB ) ).toBe( true );
		});
		it('should shift right', function () {
			this.coordsA = new Coordinates( 5, 5 );
			this.coordsB = new Coordinates( 6, 5 );
			this.coordsIncr = this.coordsA.getIncrement( 1, 0 );

			expect( this.coordsIncr.equals( this.coordsB ) ).toBe( true );
		});
	});
});

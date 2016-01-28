var expect = chai.expect;
var assert = chai.assert;

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
			expect( this.rangeTop.count() ).to.equal( 5 );
		});
		it('should return 5 for the left', function () {
			expect( this.rangeLeft.count() ).to.equal( 5 );
		});
		it('should return 5 for the right', function () {
			expect( this.rangeRight.count() ).to.equal( 5 );
		});
		it('should return 5 for the bottom', function () {
			expect( this.rangeBottom.count() ).to.equal( 5 );
		});
		it('should return 25 for the outerRange', function () {
			expect( this.outerRange.count() ).to.equal( 25 );
		});
	});

	describe("#getRotated()", function () {
		it('should rotate from left to right', function () {
			this.rotated = this.rangeLeft.getRotated( this.outerRange );
			expect( this.rotated.equals( this.rangeRight ) ).to.equal( true );
		});
		it('should rotate from right to left ', function () {
			this.rotated = this.rangeRight.getRotated( this.outerRange );
			expect( this.rotated.equals( this.rangeLeft ) ).to.equal( true );
		});
		it('should rotate from top to bottom', function () {
			this.rotated = this.rangeTop.getRotated( this.outerRange );
			expect( this.rotated.equals( this.rangeBottom ) ).to.equal( true );
		});
		it('should rotate from bottom to top', function () {
			this.rotated = this.rangeBottom.getRotated( this.outerRange );
			expect( this.rotated.equals( this.rangeTop ) ).to.equal( true );
		});
	});
});

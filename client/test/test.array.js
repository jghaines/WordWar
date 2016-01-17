var expect = chai.expect;

describe('Array', function() {
	describe('#indexOf()', function () {
		it('should return -1 when the value is not present', function () {
			expect( [1,2,3].indexOf(5) ).to.equal( -1 );
			expect( [1,2,3].indexOf(0) ).to.equal( -1 );
		});
	});

	describe('#lastIndexWhere()', function () {
		it('should return -1 when the value is not present', function () {
			expect( [1,2,3].lastIndexWhere( function() { return false } ) ).to.equal( -1 );
			expect( [1,2,3].lastIndexWhere( function() { return this < 1 } ) ).to.equal( -1 );
		});
		it('should return 2 when only the last element matches', function () {
			expect( [1,2,3].lastIndexWhere( function() { return this == 3 } ) ).to.equal( 2 );
		});
		it('should return 0 when only the first element matches', function () {
			expect( [1,2,3].lastIndexWhere( function() { return this == 1 } ) ).to.equal( 0 );
		});
		it('should return 2 when the first and last elements match', function () {
			expect( [1,0,1].lastIndexWhere( function() { return this == 1 } ) ).to.equal( 2 );
		});
	});

	describe('#firstIndexWhere()', function () {
		it('should return -1 when the value is not present', function () {
			expect( [1,2,3].firstIndexWhere( function() { return false } ) ).to.equal( -1 );
			expect( [1,2,3].firstIndexWhere( function() { return this < 1 } ) ).to.equal( -1 );
		});
		it('should return 2 when only the last element matches', function () {
			expect( [1,2,3].firstIndexWhere( function() { return this == 3 } ) ).to.equal( 2 );
		});
		it('should return 0 when only the first element matches', function () {
			expect( [1,2,3].firstIndexWhere( function() { return this == 1 } ) ).to.equal( 0 );
		});
		it('should return 0 when the first and last elements match', function () {
			expect( [1,0,1].firstIndexWhere( function() { return this == 1 } ) ).to.equal( 0 );
		});
	});

	describe('#firstIndexWhere(,#)', function () {
		it('should return 2 when the first and last elements match and we are skipping', function () {
			expect( [1,0,1].firstIndexWhere( function() { return this == 1 }, 1 ) ).to.equal( 2 );
			expect( [1,0,1].firstIndexWhere( function() { return this == 1 }, 2 ) ).to.equal( 2 );
		});
		it('should return -1 when we skipped all matching elements', function () {
			expect( [1,0,1].firstIndexWhere( function() { return this == 1 }, 3 ) ).to.equal( -1 );
		});
	});
});
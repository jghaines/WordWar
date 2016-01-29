describe('Array', function() {
	describe('#lastIndexWhere()', function () {
		it('should return -1 when the value is not present', function () {
			expect( [1,2,3].lastIndexWhere( function() { return false } ) ).toEqual( -1 );
			expect( [1,2,3].lastIndexWhere( function() { return this < 1 } ) ).toEqual( -1 );
		});
		it('should return 2 when only the last element matches', function () {
			expect( [1,2,3].lastIndexWhere( function() { return this == 3 } ) ).toEqual( 2 );
		});
		it('should return 0 when only the first element matches', function () {
			expect( [1,2,3].lastIndexWhere( function() { return this == 1 } ) ).toEqual( 0 );
		});
		it('should return 2 when the first and last elements match', function () {
			expect( [1,0,1].lastIndexWhere( function() { return this == 1 } ) ).toEqual( 2 );
		});
	});

	describe('#firstIndexWhere()', function () {
		it('should return -1 when the value is not present', function () {
			expect( [1,2,3].firstIndexWhere( function() { return false } ) ).toEqual( -1 );
			expect( [1,2,3].firstIndexWhere( function() { return this < 1 } ) ).toEqual( -1 );
		});
		it('should return 2 when only the last element matches', function () {
			expect( [1,2,3].firstIndexWhere( function() { return this == 3 } ) ).toEqual( 2 );
		});
		it('should return 0 when only the first element matches', function () {
			expect( [1,2,3].firstIndexWhere( function() { return this == 1 } ) ).toEqual( 0 );
		});
		it('should return 0 when the first and last elements match', function () {
			expect( [1,0,1].firstIndexWhere( function() { return this == 1 } ) ).toEqual( 0 );
		});
	});

	describe('#firstIndexWhere(,#)', function () {
		it('should return 2 when the first and last elements match and we are skipping', function () {
			expect( [1,0,1].firstIndexWhere( function() { return this == 1 }, 1 ) ).toEqual( 2 );
			expect( [1,0,1].firstIndexWhere( function() { return this == 1 }, 2 ) ).toEqual( 2 );
		});
		it('should return -1 when we skipped all matching elements', function () {
			expect( [1,0,1].firstIndexWhere( function() { return this == 1 }, 3 ) ).toEqual( -1 );
		});
	});
});


describe('String', function() {
	describe('#toTitleCase()', function () {
		it('should work on empty string', function () {
			expect( ''.toTitleCase() ).toEqual( '' );
		});
		it('should work on single letter', function () {
			expect( 'a'.toTitleCase() ).toEqual( 'A' );
		});
		it('should work on lowercase words', function () {
			expect( 'lowercase'.toTitleCase() ).toEqual( 'Lowercase' );
		});
		it('should work on UPPERCASE words', function () {
			expect( 'UPPERCASE'.toTitleCase() ).toEqual( 'Uppercase' );
		});
		it('should work on mIXedCasE words', function () {
			expect( 'mIXedCasE'.toTitleCase() ).toEqual( 'Mixedcase' );
		});
	});
});

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
    
	describe('#countWhere()', function () {
		it('should return array length for true callback', function () {
			expect( [1,0,1].countWhere( function(o) { return true } ) ).toEqual( 3 );
		});
		it('should return non-null count for non-null callback', function () {
            var sparseArray = [];
            sparseArray[1] =  1;
            sparseArray[3] = 3;
			expect( sparseArray.countWhere( notNull )).toEqual( 2 );
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

describe('notNull', function() {
    it('return false for null', function () {
        expect( notNull( null ) ).toEqual( false );
    });
    it('return true for existent element in sparseArray', function () {
        var sparseArray = [];
        sparseArray[1] =  1;
        sparseArray[3] = 3;
        expect( notNull( sparseArray[1] )).toEqual( true );
        expect( notNull( sparseArray[3] )).toEqual( true );
    });
    it('return false for non-existent elements in sparseArray', function () {
        var sparseArray = [];
        sparseArray[1] =  1;
        sparseArray[3] = 3;
        expect( notNull( sparseArray[0] )).toEqual( false );
        expect( notNull( sparseArray[2] )).toEqual( false );
        expect( notNull( sparseArray[4] )).toEqual( false );
    });
    it('return true for {} object', function () {
        expect( notNull( {} )).toEqual( true );
    });
    it('return true for 42 integer', function () {
        expect( notNull( 42 )).toEqual( true );
    });
});

'use strict';

describe('TurnPointsEqualsWordPointsStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new TurnPointsEqualsWordPointsStrategy();
		this.playA = { wordPoints : 15 };
		this.playB = { wordPoints : 12 };
		this.scoreStrategy.execute([ this.playA, this.playB ]);
	});

	describe('#execute()', function () {
		it('should set the score to the word value', function () {
			expect( this.playA.turnPoints ).toEqual( 15 );
			expect( this.playB.turnPoints ).toEqual( 12 );
		});
		it('should leave the wordPoints unchanged', function () {
			expect( this.playA.wordPoints ).toEqual( 15 );
			expect( this.playB.wordPoints ).toEqual( 12 );
		});
	});
});


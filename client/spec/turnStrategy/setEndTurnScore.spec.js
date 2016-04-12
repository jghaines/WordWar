'use strict';

describe('SetEndTurnStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new SetEndTurnStrategy();
		this.playA = { startTurnScore : 100, turnPoints : 10 };
		this.playB = { startTurnScore : 200, turnPoints : -20 };
		this.scoreStrategy.execute([ this.playA, this.playB ]);
	});

	describe('#execute()', function () {
		it('should increment/decrement the endTurnScore by turnPoints', function () {
			expect( this.playA.endTurnScore ).toEqual( 100 + 10 );
			expect( this.playB.endTurnScore ).toEqual( 200 - 20 );
		});
		it('should leave the turnPoints unchanged', function () {
			expect( this.playA.turnPoints ).toEqual( 10 );
			expect( this.playB.turnPoints ).toEqual( -20 );
		});
	});
});


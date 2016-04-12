describe('EndGameMaxTurnsStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new EndGameMaxTurnsStrategy( 10 );
	});

	describe('#execute()', function () {
		it('should do nothing if below maxTurns', function () {
			var playA = { turnIndex : 8, lost : false };
			var playB = { turnIndex : 8, lost : false };
			this.scoreStrategy.execute([ playA, playB ]);
			expect( playA.lost ).toBe( false );
			expect( playB.lost ).toBe( false );
		});
		it('should set the lost flag to the lower score player at (maxTurns - 1)', function () {
			var playA = { turnIndex : 9, lost : false, endTurnScore : 100 };
			var playB = { turnIndex : 9, lost : false, endTurnScore : 90 };
			this.scoreStrategy.execute([ playA, playB ]);
			expect( playA.lost ).toBe( false );
			expect( playB.lost ).toBe( true );
		});
		it('should set the lost flag to the lower score player at (maxTurns - 1), reverse order', function () {
			var playA = { turnIndex : 9, lost : false, endTurnScore : 100 };
			var playB = { turnIndex : 9, lost : false, endTurnScore : 90 };
			this.scoreStrategy.execute([ playB, playA ]); // note order
			expect( playA.lost ).toBe( false );
			expect( playB.lost ).toBe( true );
		});
	});
});

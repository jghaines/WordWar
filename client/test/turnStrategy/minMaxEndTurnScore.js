describe('MinMaxEndTurnStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new MinMaxEndTurnStrategy( -100, 200 );
	});

	describe('#calculateScore()', function () {
		it('should reset the endTurnScore if it is below range', function () {
			var play = { endTurnScore : -150 };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.endTurnScore ).toEqual( -100 );
		});
		it('should not change the endTurnScore if it is in range', function () {
			var play = { endTurnScore : 50 };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.endTurnScore ).toEqual( 50 );
		});
		it('should reset the endTurnScore if it is above range', function () {
			var play = { endTurnScore : 210 };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.endTurnScore ).toEqual( 200 );
		});
	});
});

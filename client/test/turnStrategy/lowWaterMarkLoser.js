describe('LowWaterMarkLoserStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new LowWaterMarkLoserStrategy( 0 );
		this.scoreStrategyNegative = new LowWaterMarkLoserStrategy( -100 );
	});

	describe('#execute()', function () {
		it('should set the lost flag if the endTurnScore is below lowWaterMark', function () {
			var play = { endTurnScore : -50 };
			this.scoreStrategy.execute([ play ]);
			expect( play.lost ).toBe( true );
		});
		it('should set the lost flag to false if the endTurnScore is above the lowWaterMark', function () {
			var play = { endTurnScore : 50 };
			this.scoreStrategy.execute([ play ]);
			expect( play.lost ).toBe( false );
		});
		it('should flag lost for negative lowWaterMark', function () {
			var play = { endTurnScore : -150 };
			this.scoreStrategyNegative.execute([ play ]);
			expect( play.lost ).toBe( true );
		});
		it('should flag not-lost for negative lowWaterMark', function () {
			var play = { endTurnScore : -50 };
			this.scoreStrategyNegative.execute([ play ]);
			expect( play.lost ).toBe( false );
		});
	});
});

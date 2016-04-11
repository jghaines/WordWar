describe('MinMaxAttackMultiplierStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new MinMaxAttackMultiplierStrategy( 0, 5 );
	});

	describe('#calculateScore()', function () {
		it('should reset the endAttackMultiplier if it is below range', function () {
			var play = { endAttackMultiplier : -1 };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.endAttackMultiplier ).toEqual( 0 );
		});
		it('should not change the endAttackMultiplier if it is in range', function () {
			var play = { endAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.endAttackMultiplier ).toEqual( 2 );
		});
		it('should reset the endAttackMultiplier if it is above range', function () {
			var play = { endAttackMultiplier : 6 };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.endAttackMultiplier ).toEqual( 5 );
		});
	});
});

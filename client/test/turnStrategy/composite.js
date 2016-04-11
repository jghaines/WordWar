describe('CompositeStrategy', function() {
	beforeEach(	function() {
		this.StrategyA = jasmine.createSpy('StrategyA')
		this.StrategyB = jasmine.createSpy('StrategyB')

		this.Strategy = new CompositeStrategy( [
			this.StrategyA,
			this.StrategyB,
		] );
	});

	describe('#execute()', function () {
		it('should invoke its component strategies exactly once', function () {
			var StrategySpyA = jasmine.createSpyObj( 'StrategyA', [ 'execute' ]);
			var StrategySpyB = jasmine.createSpyObj( 'StrategyB', [ 'execute' ]);

			this.Strategy = new CompositeStrategy( [
				StrategySpyA,
				StrategySpyB,
			] );
			this.Strategy.execute([ new Play() ]);
			expect( StrategySpyA.execute.calls.count() ).toEqual( 1 );
			expect( StrategySpyA.execute.calls.count() ).toEqual( 1 );
		});
		it('should correctly calculate from a double composite', function () {
			var playA = { wordPoints : 15, word: 'LONGER' };
			var playB = { wordPoints : 12, word: 'WALL' };

			this.Strategy = new CompositeStrategy( [
				new TurnPointsEqualsWordPointsStrategy(),
				new WordLengthBonusStrategy( [
					{ from:  5, to: 10, bonus: 10 },
				])
			] );
			this.Strategy.execute([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 + 10 );
			expect( playB.turnPoints ).toEqual( 12 );
		});
	});
});

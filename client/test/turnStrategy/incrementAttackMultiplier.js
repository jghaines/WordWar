describe('IncrementAttackMultiplierStrategy', function() {
	beforeEach(	function() {
		this.Strategy = new IncrementAttackMultiplierStrategy( 1, -2 );
		this.playA = { playType : 'move',   startAttackMultiplier : 2 };
		this.playB = { playType : 'attack', startAttackMultiplier : 10 };
		this.Strategy.calculateScore([ this.playA, this.playB ]);
	});

	describe('#calculateScore()', function () {
		it('should increment my moveIncrement after a move', function () {
			expect( this.playA.endAttackMultiplier ).toEqual( 2 + 1 );
		});
		it('should increment by attackIncrement after an attack', function () {
			expect( this.playB.endAttackMultiplier ).toEqual( 10 - 2 );
		});
	});
});

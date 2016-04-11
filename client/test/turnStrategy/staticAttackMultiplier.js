describe('StaticAttackMultiplierStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new StaticAttackMultiplierStrategy( 2 );
		this.playA = { startAttackMultiplier : 2 };
		this.playB = { startAttackMultiplier : 10 };
		this.scoreStrategy.calculateScore([ this.playA, this.playB ]);
	});

	describe('#calculateScore()', function () {
		it('should set startAttackMultiplier to 2 if it has that value', function () {
			expect( this.playA.startAttackMultiplier ).toEqual( 2 );
			expect( this.playA.endAttackMultiplier ).toEqual( 2 );
		});
		it('should reset it to 2 otherwise', function () {
			expect( this.playB.startAttackMultiplier ).toEqual( 2 );
			expect( this.playB.endAttackMultiplier ).toEqual( 2 );
		});
	});
});

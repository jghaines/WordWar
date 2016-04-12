describe('PlayTypeCombinationConditionalStrategy', function() {
    beforeEach( function() {
        this.playAttack = { playType : 'attack' };
        this.playMove   = { playType : 'move'   };
    });
	describe('attack vs move', function () {
        beforeEach( function() {
            this.scoreStrategy = new PlayTypeCombinationConditionalStrategy( [ 'attack', 'move' ] );
        });
		it('should match on attack vs move', function () { 
            var plays = [ this.playAttack, this.playMove ];
			expect( this.scoreStrategy.execute( plays ) ).toBe( true );
		});
		it('should match on move vs attack', function () { 
            var plays = [ this.playMove, this.playAttack ];
			expect( this.scoreStrategy.execute( plays ) ).toBe( true );
		});
		it('should NOT match on move vs move', function () { 
            var plays = [ this.playMove, this.playMove ];
			expect( this.scoreStrategy.execute( plays ) ).toBe( false );
		});
		it('should NOT match on attack vs attack', function () { 
            var plays = [ this.playAttack, this.playAttack ];
			expect( this.scoreStrategy.execute( plays ) ).toBe( false );
		});
	});
	describe('attack vs attack', function () {
        beforeEach( function() {
            this.scoreStrategy = new PlayTypeCombinationConditionalStrategy( [ 'attack', 'attack' ] );
        });
		it('should NOT match on attack vs move', function () { 
            var plays = [ this.playAttack, this.playMove ];
			expect( this.scoreStrategy.execute( plays ) ).toBe( false );
		});
		it('should NOT match on move vs attack', function () { 
            var plays = [ this.playMove, this.playAttack ];
			expect( this.scoreStrategy.execute( plays ) ).toBe( false );
		});
		it('should NOT match on move vs move', function () { 
            var plays = [ this.playMove, this.playMove ];
			expect( this.scoreStrategy.execute( plays ) ).toBe( false );
		});
		it('should match on attack vs attack', function () { 
            var plays = [ this.playAttack, this.playAttack ];
			expect( this.scoreStrategy.execute( plays ) ).toBe( true );
		});
	});
	describe('move vs move', function () {
        beforeEach( function() {
            this.scoreStrategy = new PlayTypeCombinationConditionalStrategy( [ 'move', 'move' ]);
        });
		it('should NOT match on attack vs move', function () { 
            var plays = [ this.playAttack, this.playMove ];
			expect( this.scoreStrategy.execute( plays ) ).toBe( false );
		});
		it('should NOT match on move vs attack', function () { 
            var plays = [ this.playMove, this.playAttack ];
			expect( this.scoreStrategy.execute( plays ) ).toBe( false );
		});
		it('should match on move vs move', function () { 
            var plays = [ this.playMove, this.playMove ];
			expect( this.scoreStrategy.execute( plays ) ).toBe( true );
		});
		it('should NOT match on attack vs attack', function () { 
            var plays = [ this.playAttack, this.playAttack ];
			expect( this.scoreStrategy.execute( plays ) ).toBe( false );
		});
	});
});

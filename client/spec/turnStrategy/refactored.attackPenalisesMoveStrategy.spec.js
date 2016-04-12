describe('complicated composite victory scoring - refactored AttackPenalisesMoveStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new CompositeStrategy( [
            new IfThenStrategy( {
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'move', 'move' ] ),
                thenDo : [] }),
            new IfThenStrategy( { 
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'attack', 'move' ] ),
                thenDo : [
                    new ApplyAttackMulitiplierStrategy(),
                    new AttackWinsMetaStrategy( {
                        winner : _ => { return 0 },
                        loser  : _ => { return _.loser.turnPoints - _.winner.turnPoints }
                    })
                ]}),
            new IfThenStrategy( { 
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'attack', 'attack' ] ),
                thenDo : [ 
                    new ApplyAttackMulitiplierStrategy(),
                    new HighScoreWinsMetaStrategy( {
                        winner : _ => { return 0 },
                        loser  : _ => { return -1 * _.winner.turnPoints },
                    }),
                ]}),
        ]);
	});

	describe('#execute()', function () {
		it('should set the score to the word value for Move vs Move', function () {
			var playA = { playType : 'move', turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'move', turnPoints : 12, startAttackMultiplier : 2 };
			this.scoreStrategy.execute([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 );
			expect( playB.turnPoints ).toEqual( 12 );
		});
		it('should penalise a Move player against an Attack', function () {
			var playA = { playType : 'move',   turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			this.scoreStrategy.execute([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 - 2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise a Move player against an Attack - when players are swapped', function () {
			var playA = { playType : 'move',   turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			this.scoreStrategy.execute([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( 15 - 2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should result in a 0-0 draw when two Attacks are equal value', function () {
			var playA = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			this.scoreStrategy.execute([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 0 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack', function () {
			var playA = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			this.scoreStrategy.execute([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( -2 * 15 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack - when players are swapped', function () {
			var playA = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			this.scoreStrategy.execute([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( -2 * 15 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
	});
});

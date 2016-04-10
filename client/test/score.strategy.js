describe('TurnPointsEqualsWordPointsScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new TurnPointsEqualsWordPointsScoreStrategy();
		this.playA = { wordPoints : 15 };
		this.playB = { wordPoints : 12 };
		this.scoreStrategy.calculateScore([ this.playA, this.playB ]);
	});

	describe('#calculateScore()', function () {
		it('should set the score to the word value', function () {
			expect( this.playA.turnPoints ).toEqual( 15 );
			expect( this.playB.turnPoints ).toEqual( 12 );
		});
		it('should leave the wordPoints unchanged', function () {
			expect( this.playA.wordPoints ).toEqual( 15 );
			expect( this.playB.wordPoints ).toEqual( 12 );
		});
	});
});

describe('SetEndTurnScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new SetEndTurnScoreStrategy();
		this.playA = { startTurnScore : 100, turnPoints : 10 };
		this.playB = { startTurnScore : 200, turnPoints : -20 };
		this.scoreStrategy.calculateScore([ this.playA, this.playB ]);
	});

	describe('#calculateScore()', function () {
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

describe('WordLengthBonusScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new WordLengthBonusScoreStrategy( [
			{ from:  6, to:  7, bonus: 10 },
			{ from:  8, to:  9, bonus: 20 },
			{ from: 10, to: 99, bonus: 30 },
		]);
	});

	describe('#calculateScore()', function () {
		it('should not give bonuses for short words', function () {
			var play;
			play = { turnPoints : 10, word : 'DOG' };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.turnPoints ).toEqual( 10 );
			play = { turnPoints : 10, word : 'BEAST' };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.turnPoints ).toEqual( 10 );
		});
		it('should give 10-point bonus for six, seven letter words', function () {
			var play;
			play = { turnPoints : 10, word : 'WHIZZY' };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.turnPoints ).toEqual( 10 + 10 );
			play = { turnPoints : 10, word : 'RUNNERS' };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.turnPoints ).toEqual( 10 + 10);
		});
		it('should give 20-point bonus for eight, nine letter words', function () {
			var play;
			play = { turnPoints : 8, word : 'STALLION' };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.turnPoints ).toEqual( 8 + 20 );
			play = { turnPoints : 9, word : 'INTESTINE' };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.turnPoints ).toEqual( 9 + 20 );
		});
		it('should give 30-point bonus for ten+ letter words', function () {
			var play;
			play = { turnPoints : 10, word : 'TOILETRIES' };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.turnPoints ).toEqual( 10 + 30 );
			play = { turnPoints : 12, word : 'ANTINEUTRINO' };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.turnPoints ).toEqual( 12 + 30 );
		});
	});
});

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
			expect( this.scoreStrategy.calculateScore( plays ) ).toBe( true );
		});
		it('should match on move vs attack', function () { 
            var plays = [ this.playMove, this.playAttack ];
			expect( this.scoreStrategy.calculateScore( plays ) ).toBe( true );
		});
		it('should NOT match on move vs move', function () { 
            var plays = [ this.playMove, this.playMove ];
			expect( this.scoreStrategy.calculateScore( plays ) ).toBe( false );
		});
		it('should NOT match on attack vs attack', function () { 
            var plays = [ this.playAttack, this.playAttack ];
			expect( this.scoreStrategy.calculateScore( plays ) ).toBe( false );
		});
	});
	describe('attack vs attack', function () {
        beforeEach( function() {
            this.scoreStrategy = new PlayTypeCombinationConditionalStrategy( [ 'attack', 'attack' ] );
        });
		it('should NOT match on attack vs move', function () { 
            var plays = [ this.playAttack, this.playMove ];
			expect( this.scoreStrategy.calculateScore( plays ) ).toBe( false );
		});
		it('should NOT match on move vs attack', function () { 
            var plays = [ this.playMove, this.playAttack ];
			expect( this.scoreStrategy.calculateScore( plays ) ).toBe( false );
		});
		it('should NOT match on move vs move', function () { 
            var plays = [ this.playMove, this.playMove ];
			expect( this.scoreStrategy.calculateScore( plays ) ).toBe( false );
		});
		it('should match on attack vs attack', function () { 
            var plays = [ this.playAttack, this.playAttack ];
			expect( this.scoreStrategy.calculateScore( plays ) ).toBe( true );
		});
	});
	describe('move vs move', function () {
        beforeEach( function() {
            this.scoreStrategy = new PlayTypeCombinationConditionalStrategy( [ 'move', 'move' ]);
        });
		it('should NOT match on attack vs move', function () { 
            var plays = [ this.playAttack, this.playMove ];
			expect( this.scoreStrategy.calculateScore( plays ) ).toBe( false );
		});
		it('should NOT match on move vs attack', function () { 
            var plays = [ this.playMove, this.playAttack ];
			expect( this.scoreStrategy.calculateScore( plays ) ).toBe( false );
		});
		it('should match on move vs move', function () { 
            var plays = [ this.playMove, this.playMove ];
			expect( this.scoreStrategy.calculateScore( plays ) ).toBe( true );
		});
		it('should NOT match on attack vs attack', function () { 
            var plays = [ this.playAttack, this.playAttack ];
			expect( this.scoreStrategy.calculateScore( plays ) ).toBe( false );
		});
	});
});


describe('complicated composite victory scoring - refactored AttackBeatsMoveScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new CompositeScoreStrategy( [
            new IfThenStrategy( {
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'move', 'move' ] ),
                thenDo : [] }),
            new IfThenStrategy( { 
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'attack', 'move' ] ),
                thenDo : [
                    new ApplyAttackMulitiplierScoreStrategy(),
                    new AttackWinsMetaStrategy( {
                        winner : _ => { return 0 },
                        loser  : _ => { return -1 * _.winner.turnPoints }
                    })
                ]}),
            new IfThenStrategy( { 
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'attack', 'attack' ] ),
                thenDo : [ 
                    new ApplyAttackMulitiplierScoreStrategy(),
                    new HighScoreWinsMetaStrategy( {
                        winner : _ => { return 0 },
                        loser  : _ => { return -1 * _.winner.turnPoints },
                    }),
                ]}),
        ]);
	});

	describe('#calculateScore()', function () {
		it('should leave turnPoints unchanged for Move vs Move', function () {
			var playA = { playType : 'move',   turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'move',   turnPoints : 12, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 );
			expect( playB.turnPoints ).toEqual( 12 );
		});
		it('should penalise a Move player against an Attack', function () {
			var playA = { playType : 'move',   turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( -2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise a Move player against an Attack - when players are swapped', function () {
			var playA = { playType : 'move',   turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( -2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should result in a 0-0 draw when two Attacks are equal value', function () {
			var playA = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 0 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack', function () {
			var playA = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( -2 * 15 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack - when players are swapped', function () {
			var playA = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( -2 * 15 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
	});
});

describe('complicated composite victory scoring - refactored AttackPenalisesMoveScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new CompositeScoreStrategy( [
            new IfThenStrategy( {
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'move', 'move' ] ),
                thenDo : [] }),
            new IfThenStrategy( { 
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'attack', 'move' ] ),
                thenDo : [
                    new ApplyAttackMulitiplierScoreStrategy(),
                    new AttackWinsMetaStrategy( {
                        winner : _ => { return 0 },
                        loser  : _ => { return _.loser.turnPoints - _.winner.turnPoints }
                    })
                ]}),
            new IfThenStrategy( { 
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'attack', 'attack' ] ),
                thenDo : [ 
                    new ApplyAttackMulitiplierScoreStrategy(),
                    new HighScoreWinsMetaStrategy( {
                        winner : _ => { return 0 },
                        loser  : _ => { return -1 * _.winner.turnPoints },
                    }),
                ]}),
        ]);
	});

	describe('#calculateScore()', function () {
		it('should set the score to the word value for Move vs Move', function () {
			var playA = { playType : 'move', turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'move', turnPoints : 12, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 );
			expect( playB.turnPoints ).toEqual( 12 );
		});
		it('should penalise a Move player against an Attack', function () {
			var playA = { playType : 'move',   turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 - 2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise a Move player against an Attack - when players are swapped', function () {
			var playA = { playType : 'move',   turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( 15 - 2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should result in a 0-0 draw when two Attacks are equal value', function () {
			var playA = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 0 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack', function () {
			var playA = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( -2 * 15 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack - when players are swapped', function () {
			var playA = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( -2 * 15 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
	});
});

describe('complicated composite victory scoring - refactored WinnerBeatsLoserScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new CompositeScoreStrategy( [
            new IfThenStrategy( {
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'move', 'move' ] ),
                thenDo : [] }),
            new IfThenStrategy( { 
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'attack', 'move' ] ),
                thenDo : [
                    new ApplyAttackMulitiplierScoreStrategy(),
                    new AttackWinsMetaStrategy( {
                        winner : _ => { return 0 },
                        loser  : _ => { return _.loser.turnPoints - _.winner.turnPoints }
                    })
                ]}),
            new IfThenStrategy( { 
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'attack', 'attack' ] ),
                thenDo : [ 
                    new HighScoreWinsMetaStrategy( {
                        winner : _ => { return 0 },
                        loser  : _ => { return _.loser.turnPoints - ( _.winner.startAttackMultiplier * _.winner.turnPoints ) },
                    }),
                ]}),
        ]);
	});

	describe('#calculateScore()', function () {
		it('should set the score to the word value for Move vs Move', function () {
			var playA = { playType : 'move', turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'move', turnPoints : 12, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 );
			expect( playB.turnPoints ).toEqual( 12 );
		});
		it('should penalise a Move player against an Attack', function () {
			var playA = { playType : 'move',   turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 - 2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise a Move player against an Attack - when players are swapped', function () {
			var playA = { playType : 'move',   turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( 15 - 2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should result in a 0-0 draw when two Attacks are equal value', function () {
			var playA = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 0 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack', function () {
			var playA = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 12 - 2 * 15 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack - when players are swapped', function () {
			var playA = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( 12 - 2 * 15 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
	});
});

describe('complicated composite victory scoring - refactored WinnerPenalisesLoserScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new CompositeScoreStrategy( [
            new IfThenStrategy( {
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'move', 'move' ] ),
                thenDo : [] }),
            new IfThenStrategy( { 
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'attack', 'move' ] ),
                thenDo : [
                    new ApplyAttackMulitiplierScoreStrategy(),
                    new AttackWinsMetaStrategy( {
                        winner : _ => { return 0 },
                        loser  : _ => { return _.loser.turnPoints - _.winner.turnPoints }
                    })
                ]}),
            new IfThenStrategy( { 
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'attack', 'attack' ] ),
                thenDo : [ 
                    new ApplyAttackMulitiplierScoreStrategy(),
                    new HighScoreWinsMetaStrategy( {
                        winner : _ => { return 0 },
                        loser  : _ => { return _.loser.turnPoints -  _.winner.turnPoints },
                    }),
                ]}),
        ]);
	});

	describe('#calculateScore()', function () {
		it('should set the score to the word value for Move vs Move', function () {
			var playA = { playType : 'move', turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'move', turnPoints : 12, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 );
			expect( playB.turnPoints ).toEqual( 12 );
		});
		it('should penalise a Move player against an Attack', function () {
			var playA = { playType : 'move',   turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 - 2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise a Move player against an Attack - when players are swapped', function () {
			var playA = { playType : 'move',   turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( 15 - 2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should result in a 0-0 draw when two Attacks are equal value', function () {
			var playA = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 0 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack', function () {
			var playA = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( ( 12 * 2 ) - ( 15 * 2 ) );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack - when players are swapped', function () {
			var playA = { playType : 'attack', turnPoints : 12, startAttackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, startAttackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( ( 12 * 2 ) - ( 15 * 2 ) );
			expect( playB.turnPoints ).toEqual( 0 );
		});
	});
});

describe('StaticAttackMultiplierScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new StaticAttackMultiplierScoreStrategy( 2 );
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

describe('IncrementAttackMultiplierScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new IncrementAttackMultiplierScoreStrategy( 1, -2 );
		this.playA = { playType : 'move',   startAttackMultiplier : 2 };
		this.playB = { playType : 'attack', startAttackMultiplier : 10 };
		this.scoreStrategy.calculateScore([ this.playA, this.playB ]);
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

describe('MinMaxAttackMultiplierScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new MinMaxAttackMultiplierScoreStrategy( 0, 5 );
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

describe('MinMaxEndTurnScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new MinMaxEndTurnScoreStrategy( -100, 200 );
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

describe('LowWaterMarkLoserScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new LowWaterMarkLoserScoreStrategy( 0 );
		this.scoreStrategyNegative = new LowWaterMarkLoserScoreStrategy( -100 );
	});

	describe('#calculateScore()', function () {
		it('should set the lost flag if the endTurnScore is below lowWaterMark', function () {
			var play = { endTurnScore : -50 };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.lost ).toBe( true );
		});
		it('should set the lost flag to false if the endTurnScore is above the lowWaterMark', function () {
			var play = { endTurnScore : 50 };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.lost ).toEqual( false );
		});
		it('should flag lost for negative lowWaterMark', function () {
			var play = { endTurnScore : -150 };
			this.scoreStrategyNegative.calculateScore([ play ]);
			expect( play.lost ).toBe( true );
		});
		it('should flag not-lost for negative lowWaterMark', function () {
			var play = { endTurnScore : -50 };
			this.scoreStrategyNegative.calculateScore([ play ]);
			expect( play.lost ).toEqual( false );
		});
	});
});


describe('CompositeScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategyA = jasmine.createSpy('ScoreStrategyA')
		this.scoreStrategyB = jasmine.createSpy('ScoreStrategyB')

		this.scoreStrategy = new CompositeScoreStrategy( [
			this.scoreStrategyA,
			this.scoreStrategyB,
		] );
	});

	describe('#calculateScore()', function () {
		it('should invoke its component strategies exactly once', function () {
			var scoreStrategySpyA = jasmine.createSpyObj( 'ScoreStrategyA', [ 'calculateScore' ]);
			var scoreStrategySpyB = jasmine.createSpyObj( 'ScoreStrategyB', [ 'calculateScore' ]);

			this.scoreStrategy = new CompositeScoreStrategy( [
				scoreStrategySpyA,
				scoreStrategySpyB,
			] );
			this.scoreStrategy.calculateScore([ new Play() ]);
			expect( scoreStrategySpyA.calculateScore.calls.count() ).toEqual( 1 );
			expect( scoreStrategySpyA.calculateScore.calls.count() ).toEqual( 1 );
		});
		it('should correctly calculate from a double composite', function () {
			var playA = { wordPoints : 15, word: 'LONGER' };
			var playB = { wordPoints : 12, word: 'WALL' };

			this.scoreStrategy = new CompositeScoreStrategy( [
				new TurnPointsEqualsWordPointsScoreStrategy(),
				new WordLengthBonusScoreStrategy( [
					{ from:  5, to: 10, bonus: 10 },
				])
			] );
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 + 10 );
			expect( playB.turnPoints ).toEqual( 12 );
		});
	});
});


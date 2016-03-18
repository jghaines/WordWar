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

describe('AttackBeatsMoveScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new AttackBeatsMoveScoreStrategy( 2 );
	});

	describe('#calculateScore()', function () {
		it('should set the score to the word value for Move vs Move', function () {
			var playA = { playType : 'move',   turnPoints : 15, attackMultiplier : 2 };
			var playB = { playType : 'move',   turnPoints : 12, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 );
			expect( playB.turnPoints ).toEqual( 12 );
		});
		it('should penalise a Move player against an Attack', function () {
			var playA = { playType : 'move',   turnPoints : 15, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( -2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise a Move player against an Attack - when players are swapped', function () {
			var playA = { playType : 'move',   turnPoints : 15, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( -2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should result in a 0-0 draw when two Attacks are equal value', function () {
			var playA = { playType : 'attack', turnPoints : 15, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 0 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack', function () {
			var playA = { playType : 'attack', turnPoints : 12, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( -2 * 15 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack - when players are swapped', function () {
			var playA = { playType : 'attack', turnPoints : 12, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( -2 * 15 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
	});
});

describe('AttackPenalisesMoveScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new AttackPenalisesMoveScoreStrategy( 2 );
	});

	describe('#calculateScore()', function () {
		it('should set the score to the word value for Move vs Move', function () {
			var playA = { playType : 'move', turnPoints : 15, attackMultiplier : 2 };
			var playB = { playType : 'move', turnPoints : 12, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 );
			expect( playB.turnPoints ).toEqual( 12 );
		});
		it('should penalise a Move player against an Attack', function () {
			var playA = { playType : 'move',   turnPoints : 15, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 - 2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise a Move player against an Attack - when players are swapped', function () {
			var playA = { playType : 'move',   turnPoints : 15, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( 15 - 2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should result in a 0-0 draw when two Attacks are equal value', function () {
			var playA = { playType : 'attack', turnPoints : 15, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 0 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack', function () {
			var playA = { playType : 'attack', turnPoints : 12, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( -2 * 15 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack - when players are swapped', function () {
			var playA = { playType : 'attack', turnPoints : 12, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( -2 * 15 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
	});
});

describe('WinnerBeatsLoserScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new WinnerBeatsLoserScoreStrategy();
	});

	describe('#calculateScore()', function () {
		it('should set the score to the word value for Move vs Move', function () {
			var playA = { playType : 'move', turnPoints : 15, attackMultiplier : 2 };
			var playB = { playType : 'move', turnPoints : 12, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 );
			expect( playB.turnPoints ).toEqual( 12 );
		});
		it('should penalise a Move player against an Attack', function () {
			var playA = { playType : 'move',   turnPoints : 15, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 - 2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise a Move player against an Attack - when players are swapped', function () {
			var playA = { playType : 'move',   turnPoints : 15, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( 15 - 2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should result in a 0-0 draw when two Attacks are equal value', function () {
			var playA = { playType : 'attack', turnPoints : 15, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 0 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack', function () {
			var playA = { playType : 'attack', turnPoints : 12, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 12 - 2 * 15 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack - when players are swapped', function () {
			var playA = { playType : 'attack', turnPoints : 12, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( 12 - 2 * 15 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
	});
});

describe('WinnerPenalisesLoserScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new WinnerPenalisesLoserScoreStrategy( 2 );
	});

	describe('#calculateScore()', function () {
		it('should set the score to the word value for Move vs Move', function () {
			var playA = { playType : 'move', turnPoints : 15, attackMultiplier : 2 };
			var playB = { playType : 'move', turnPoints : 12, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 );
			expect( playB.turnPoints ).toEqual( 12 );
		});
		it('should penalise a Move player against an Attack', function () {
			var playA = { playType : 'move',   turnPoints : 15, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 15 - 2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise a Move player against an Attack - when players are swapped', function () {
			var playA = { playType : 'move',   turnPoints : 15, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 12, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( 15 - 2 * 12 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should result in a 0-0 draw when two Attacks are equal value', function () {
			var playA = { playType : 'attack', turnPoints : 15, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( 0 );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack', function () {
			var playA = { playType : 'attack', turnPoints : 12, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.turnPoints ).toEqual( ( 12 * 2 ) - ( 15 * 2 ) );
			expect( playB.turnPoints ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack - when players are swapped', function () {
			var playA = { playType : 'attack', turnPoints : 12, attackMultiplier : 2 };
			var playB = { playType : 'attack', turnPoints : 15, attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.turnPoints ).toEqual( ( 12 * 2 ) - ( 15 * 2 ) );
			expect( playB.turnPoints ).toEqual( 0 );
		});
	});
});

describe('StaticAttackMultiplierScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new StaticAttackMultiplierScoreStrategy( 2 );
		this.playA = { attackMultiplier : 2 };
		this.playB = { attackMultiplier : 10 };
		this.scoreStrategy.calculateScore([ this.playA, this.playB ]);
	});

	describe('#calculateScore()', function () {
		it('should set attackMultiplier to 2 if it has that value', function () {
			expect( this.playA.attackMultiplier ).toEqual( 2 );
		});
		it('should reset it to 2 otherwise', function () {
			expect( this.playB.attackMultiplier ).toEqual( 2 );
		});
	});
});

describe('IncrementAttackMultiplierScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new IncrementAttackMultiplierScoreStrategy( 1, -2 );
		this.playA = { playType : 'move',   attackMultiplier : 2 };
		this.playB = { playType : 'attack', attackMultiplier : 10 };
		this.scoreStrategy.calculateScore([ this.playA, this.playB ]);
	});

	describe('#calculateScore()', function () {
		it('should increment my moveIncrement after a move', function () {
			expect( this.playA.attackMultiplier ).toEqual( 2 + 1 );
		});
		it('should increment by attackIncrement after an attack', function () {
			expect( this.playB.attackMultiplier ).toEqual( 10 - 2 );
		});
	});
});

describe('MinMaxAttackMultiplierScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new MinMaxAttackMultiplierScoreStrategy( 0, 5 );
	});

	describe('#calculateScore()', function () {
		it('should reset the attackMultiplier if it is below range', function () {
			var play = { attackMultiplier : -1 };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.attackMultiplier ).toEqual( 0 );
		});
		it('should not change the attackMultiplier if it is in range', function () {
			var play = { attackMultiplier : 2 };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.attackMultiplier ).toEqual( 2 );
		});
		it('should reset the attackMultiplier if it is above range', function () {
			var play = { attackMultiplier : 6 };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.attackMultiplier ).toEqual( 5 );
		});
	});
});

describe('KnockBackPlayScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new KnockBackPlayScoreStrategy();
		this.plays = [ new Play(), new Play() ];
		this.coord00 = new Coordinates( 0, 0 );
		this.coord01 = new Coordinates( 0, 1 );
		this.coord10 = new Coordinates( 1, 0 );
		this.coord11 = new Coordinates( 1, 1 );
		this.coord05 = new Coordinates( 0, 5 );
		this.coord50 = new Coordinates( 5, 0 );
		this.range00to05 = new CoordRange( this.coord00, this.coord05 );
		this.range00to50 = new CoordRange( this.coord00, this.coord50 );
	});

	describe('#_arePlayersOnSameCell()', function () {
		it('should return true for same newPosition Coordinates', function () {
			this.plays[0].newPosition = this.coord00;
			this.plays[1].newPosition = this.coord00;
			expect( this.scoreStrategy._arePlayersOnSameCell( this.plays )).toBe( true );
		});
		it('should return false for different newPosition Coordinates', function () {
			this.plays[0].newPosition = this.coord00;
			this.plays[1].newPosition = this.coord11;
			expect( this.scoreStrategy._arePlayersOnSameCell( this.plays )).toBe( false );
		});
	});

	describe('#calculateScore()', function () {
		it('should leave the players if they are on different cells', function () {
			this.plays[0].newPosition = this.coord00;
			this.plays[1].newPosition = this.coord11;
			this.scoreStrategy.calculateScore( this.plays );
			expect( this.plays[0].newPosition.equals( this.coord00 )).toBe( true );
			expect( this.plays[1].newPosition.equals( this.coord11 )).toBe( true );
		});
		it('should knockback losing player, down, when they land on the same cell', function () {
			this.plays[0].newPosition = this.coord00;
			this.plays[0].playRange   = this.range00to50; // vertical
			this.plays[0].playType    = 'attack';
			this.plays[1].newPosition = this.coord00;
			this.plays[1].playRange   = this.range00to05; // horizontal
			this.plays[1].playType    = 'move';
			this.scoreStrategy.calculateScore( this.plays );
			expect( this.plays[0].newPosition.equals( this.coord00 )).toBe( true );
			expect( this.plays[1].newPosition.equals( this.coord01 )).toBe( true );
		});
		it('should knockback losing player, right, when they land on the same cell', function () {
			this.plays[0].newPosition = this.coord00;
			this.plays[0].playRange   = this.range00to05; // horizontal
			this.plays[0].playType    = 'attack';
			this.plays[1].newPosition = this.coord00;
			this.plays[1].playRange   = this.range00to50; // vertical
			this.plays[1].playType    = 'move';
			this.scoreStrategy.calculateScore( this.plays );
			expect( this.plays[0].newPosition.equals( this.coord00 )).toBe( true );
			expect( this.plays[1].newPosition.equals( this.coord10 )).toBe( true );
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


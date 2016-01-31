describe('ScoreEqualsWordValueScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new ScoreEqualsWordValueScoreStrategy();
		this.playA = { wordValue : 15 };
		this.playB = { wordValue : 12 };
		this.scoreStrategy.calculateScore([ this.playA, this.playB ]);
	});

	describe('#calculateScore()', function () {
		it('should set the score to the word value', function () {
			expect( this.playA.score ).toEqual( 15 );
			expect( this.playB.score ).toEqual( 12 );
		});
		it('should leave the wordValue unchanged', function () {
			expect( this.playA.wordValue ).toEqual( 15 );
			expect( this.playB.wordValue ).toEqual( 12 );
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
			play = { score : 10, word : 'DOG' };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.score ).toEqual( 10 );
			play = { score : 10, word : 'BEAST' };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.score ).toEqual( 10 );
		});
		it('should give 10-point bonus for six, seven letter words', function () {
			var play;
			play = { score : 10, word : 'WHIZZY' };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.score ).toEqual( 10 + 10 );
			play = { score : 10, word : 'RUNNERS' };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.score ).toEqual( 10 + 10);
		});
		it('should give 20-point bonus for eight, nine letter words', function () {
			var play;
			play = { score : 8, word : 'STALLION' };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.score ).toEqual( 8 + 20 );
			play = { score : 9, word : 'INTESTINE' };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.score ).toEqual( 9 + 20 );
		});
		it('should give 30-point bonus for ten+ letter words', function () {
			var play;
			play = { score : 10, word : 'TOILETRIES' };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.score ).toEqual( 10 + 30 );
			play = { score : 12, word : 'ANTINEUTRINO' };
			this.scoreStrategy.calculateScore([ play ]);
			expect( play.score ).toEqual( 12 + 30 );
		});
	});
});

describe('AttackBeatsMoveScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new AttackBeatsMoveScoreStrategy( 2 );
	});

	describe('#calculateScore()', function () {
		it('should set the score to the word value for Move vs Move', function () {
			var playA = { moveType : 'move', score : 15 };
			var playB = { moveType : 'move', score : 12 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.score ).toEqual( 15 );
			expect( playB.score ).toEqual( 12 );
		});
		it('should penalise a Move player against an Attack', function () {
			var playA = { moveType : 'move', score : 15 };
			var playB = { moveType : 'attack', score : 12 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.score ).toEqual( -2 * 12 );
			expect( playB.score ).toEqual( 0 );
		});
		it('should penalise a Move player against an Attack - when players are swapped', function () {
			var playA = { moveType : 'move', score : 15 };
			var playB = { moveType : 'attack', score : 12 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.score ).toEqual( -2 * 12 );
			expect( playB.score ).toEqual( 0 );
		});
		it('should result in a 0-0 draw when two Attacks are equal value', function () {
			var playA = { moveType : 'attack', score : 15 };
			var playB = { moveType : 'attack', score : 15 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.score ).toEqual( 0 );
			expect( playB.score ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack', function () {
			var playA = { moveType : 'attack', score : 12 };
			var playB = { moveType : 'attack', score : 15 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.score ).toEqual( -2 * 15 );
			expect( playB.score ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack - when players are swapped', function () {
			var playA = { moveType : 'attack', score : 12 };
			var playB = { moveType : 'attack', score : 15 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.score ).toEqual( -2 * 15 );
			expect( playB.score ).toEqual( 0 );
		});
	});
});

describe('AttackPenalisesMoveScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new AttackPenalisesMoveScoreStrategy( 2 );
	});

	describe('#calculateScore()', function () {
		it('should set the score to the word value for Move vs Move', function () {
			var playA = { moveType : 'move', score : 15 };
			var playB = { moveType : 'move', score : 12 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.score ).toEqual( 15 );
			expect( playB.score ).toEqual( 12 );
		});
		it('should penalise a Move player against an Attack', function () {
			var playA = { moveType : 'move', score : 15 };
			var playB = { moveType : 'attack', score : 12 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.score ).toEqual( 15 - 2 * 12 );
			expect( playB.score ).toEqual( 0 );
		});
		it('should penalise a Move player against an Attack - when players are swapped', function () {
			var playA = { moveType : 'move', score : 15 };
			var playB = { moveType : 'attack', score : 12 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.score ).toEqual( 15 - 2 * 12 );
			expect( playB.score ).toEqual( 0 );
		});
		it('should result in a 0-0 draw when two Attacks are equal value', function () {
			var playA = { moveType : 'attack', score : 15 };
			var playB = { moveType : 'attack', score : 15 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.score ).toEqual( 0 );
			expect( playB.score ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack', function () {
			var playA = { moveType : 'attack', score : 12 };
			var playB = { moveType : 'attack', score : 15 };
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.score ).toEqual( -2 * 15 );
			expect( playB.score ).toEqual( 0 );
		});
		it('should penalise the lower-scored player in an attack - when players are swapped', function () {
			var playA = { moveType : 'attack', score : 12 };
			var playB = { moveType : 'attack', score : 15 };
			this.scoreStrategy.calculateScore([ playB, playA ]); // note order
			expect( playA.score ).toEqual( -2 * 15 );
			expect( playB.score ).toEqual( 0 );
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
			var playA = { wordValue : 15, word: 'LONGER' };
			var playB = { wordValue : 12, word: 'WALL' };

			this.scoreStrategy = new CompositeScoreStrategy( [
				new ScoreEqualsWordValueScoreStrategy(),
				new WordLengthBonusScoreStrategy( [
					{ from:  5, to: 10, bonus: 10 },
				])
			] );
			this.scoreStrategy.calculateScore([ playA, playB ]);
			expect( playA.score ).toEqual( 15 + 10 );
			expect( playB.score ).toEqual( 12 );
		});
	});
});

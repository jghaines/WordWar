var expect = chai.expect;

describe('AttackBeatsMove', function() {
	beforeEach(	function() {
		this.scoreStrategy = new AttackBeatsMove();
	});

	describe('#calculateScore()', function () {
		it('should set the score to the word value for Move vs Move', function () {
			var playA = { moveType : 'move', wordValue : 15 };
			var playB = { moveType : 'move', wordValue : 12 };
			this.scoreStrategy.calculateScore( playA, playB );
			expect( playA.score ).to.equal( 15 );
			expect( playB.score ).to.equal( 12 );
		});
		it('should penalise a Move player against an Attack', function () {
			var playA = { moveType : 'move', wordValue : 15 };
			var playB = { moveType : 'attack', wordValue : 12 };
			this.scoreStrategy.calculateScore( playA, playB );
			expect( playA.score ).to.equal( -2 * playB.wordValue );
			expect( playB.score ).to.equal( 0 );
		});
		it('should penalise a Move player against an Attack - when players are swapped', function () {
			var playA = { moveType : 'move', wordValue : 15 };
			var playB = { moveType : 'attack', wordValue : 12 };
			this.scoreStrategy.calculateScore( playB, playA ); // note order
			expect( playA.score ).to.equal( -2 * playB.wordValue );
			expect( playB.score ).to.equal( 0 );
		});
		it('should result in a 0-0 draw when two Attacks are equal value', function () {
			var playA = { moveType : 'attack', wordValue : 15 };
			var playB = { moveType : 'attack', wordValue : 15 };
			this.scoreStrategy.calculateScore( playA, playB );
			expect( playA.score ).to.equal( 0 );
			expect( playB.score ).to.equal( 0 );
		});
		it('should penalise the lower-scored player in an attack', function () {
			var playA = { moveType : 'attack', wordValue : 12 };
			var playB = { moveType : 'attack', wordValue : 15 };
			this.scoreStrategy.calculateScore( playA, playB );
			expect( playA.score ).to.equal( -2 * playB.wordValue );
			expect( playB.score ).to.equal( 0 );
		});
		it('should penalise the lower-scored player in an attack - when players are swapped', function () {
			var playA = { moveType : 'attack', wordValue : 12 };
			var playB = { moveType : 'attack', wordValue : 15 };
			this.scoreStrategy.calculateScore( playB, playA ); // note order
			expect( playA.score ).to.equal( -2 * playB.wordValue );
			expect( playB.score ).to.equal( 0 );
		});
	});
});

describe.only('AttackPenalisesMove', function() {
	beforeEach(	function() {
		this.scoreStrategy = new AttackPenalisesMove();
	});

	describe('#calculateScore()', function () {
		it('should set the score to the word value for Move vs Move', function () {
			var playA = { moveType : 'move', wordValue : 15 };
			var playB = { moveType : 'move', wordValue : 12 };
			this.scoreStrategy.calculateScore( playA, playB );
			expect( playA.score ).to.equal( 15 );
			expect( playB.score ).to.equal( 12 );
		});
		it('should penalise a Move player against an Attack', function () {
			var playA = { moveType : 'move', wordValue : 15 };
			var playB = { moveType : 'attack', wordValue : 12 };
			this.scoreStrategy.calculateScore( playA, playB );
			expect( playA.score ).to.equal( playA.wordValue - 2*playB.wordValue );
			expect( playB.score ).to.equal( 0 );
		});
		it('should penalise a Move player against an Attack - when players are swapped', function () {
			var playA = { moveType : 'move', wordValue : 15 };
			var playB = { moveType : 'attack', wordValue : 12 };
			this.scoreStrategy.calculateScore( playB, playA ); // note order
			expect( playA.score ).to.equal( playA.wordValue - 2*playB.wordValue );
			expect( playB.score ).to.equal( 0 );
		});
		it('should result in a 0-0 draw when two Attacks are equal value', function () {
			var playA = { moveType : 'attack', wordValue : 15 };
			var playB = { moveType : 'attack', wordValue : 15 };
			this.scoreStrategy.calculateScore( playA, playB );
			expect( playA.score ).to.equal( 0 );
			expect( playB.score ).to.equal( 0 );
		});
		it('should penalise the lower-scored player in an attack', function () {
			var playA = { moveType : 'attack', wordValue : 12 };
			var playB = { moveType : 'attack', wordValue : 15 };
			this.scoreStrategy.calculateScore( playA, playB );
			expect( playA.score ).to.equal( -30 );
			expect( playB.score ).to.equal( 0 );
		});
		it('should penalise the lower-scored player in an attack - when players are swapped', function () {
			var playA = { moveType : 'attack', wordValue : 12 };
			var playB = { moveType : 'attack', wordValue : 15 };
			this.scoreStrategy.calculateScore( playB, playA ); // note order
			expect( playA.score ).to.equal( -30 );
			expect( playB.score ).to.equal( 0 );
		});
	});
});

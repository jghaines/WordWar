'use strict';

describe('WordLengthBonusStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new WordLengthBonusStrategy( [
			{ from:  6, to:  7, bonus: 10 },
			{ from:  8, to:  9, bonus: 20 },
			{ from: 10, to: 99, bonus: 30 },
		]);
	});

	describe('#execute()', function () {
		it('should not give bonuses for short words', function () {
			var play;
			play = { turnPoints : 10, word : 'DOG' };
			this.scoreStrategy.execute([ play ]);
			expect( play.turnPoints ).toEqual( 10 );
			play = { turnPoints : 10, word : 'BEAST' };
			this.scoreStrategy.execute([ play ]);
			expect( play.turnPoints ).toEqual( 10 );
		});
		it('should give 10-point bonus for six, seven letter words', function () {
			var play;
			play = { turnPoints : 10, word : 'WHIZZY' };
			this.scoreStrategy.execute([ play ]);
			expect( play.turnPoints ).toEqual( 10 + 10 );
			play = { turnPoints : 10, word : 'RUNNERS' };
			this.scoreStrategy.execute([ play ]);
			expect( play.turnPoints ).toEqual( 10 + 10);
		});
		it('should give 20-point bonus for eight, nine letter words', function () {
			var play;
			play = { turnPoints : 8, word : 'STALLION' };
			this.scoreStrategy.execute([ play ]);
			expect( play.turnPoints ).toEqual( 8 + 20 );
			play = { turnPoints : 9, word : 'INTESTINE' };
			this.scoreStrategy.execute([ play ]);
			expect( play.turnPoints ).toEqual( 9 + 20 );
		});
		it('should give 30-point bonus for ten+ letter words', function () {
			var play;
			play = { turnPoints : 10, word : 'TOILETRIES' };
			this.scoreStrategy.execute([ play ]);
			expect( play.turnPoints ).toEqual( 10 + 30 );
			play = { turnPoints : 12, word : 'ANTINEUTRINO' };
			this.scoreStrategy.execute([ play ]);
			expect( play.turnPoints ).toEqual( 12 + 30 );
		});
	});
});

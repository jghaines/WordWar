describe('KnockBackPlayScoreStrategy', function() {
	beforeEach(	function() {
		this.scoreStrategy = new KnockBackPlayScoreStrategy();
		this.plays = [ new Play(), new Play() ];
		this.coord00 = new Coordinates( 0, 0 );
		this.coord01 = new Coordinates( 0, 1 );
		this.coord10 = new Coordinates( 1, 0 );
		this.coord11 = new Coordinates( 1, 1 );
		this.coord05 = new Coordinates( 0, 5 );
		this.coord40 = new Coordinates( 4, 0 );
		this.coord50 = new Coordinates( 5, 0 );
		this.coord51 = new Coordinates( 5, 1 );
		this.coord54 = new Coordinates( 5, 4 );
		this.coord55 = new Coordinates( 5, 5 );
		this.range00to05 = new CoordRange( this.coord00, this.coord05 );
		this.range00to50 = new CoordRange( this.coord00, this.coord50 );
	});

	describe('#_arePlayersOnSameCell()', function () {
		it('should return true for same endPosition Coordinates', function () {
			this.plays[0].endPosition = this.coord00;
			this.plays[1].endPosition = this.coord00;
			expect( this.scoreStrategy._arePlayersOnSameCell( this.plays )).toBe( true );
		});
		it('should return false for different endPosition Coordinates', function () {
			this.plays[0].endPosition = this.coord00;
			this.plays[1].endPosition = this.coord11;
			expect( this.scoreStrategy._arePlayersOnSameCell( this.plays )).toBe( false );
		});
	});

	describe('#calculateScore()', function () {
		it('should leave the players if they are on different cells', function () {
			this.plays[0].endPosition = this.coord00;
			this.plays[1].endPosition = this.coord11;
			this.scoreStrategy.calculateScore( this.plays );
			expect( this.plays[0].endPosition.equals( this.coord00 )).toBe( true );
			expect( this.plays[1].endPosition.equals( this.coord11 )).toBe( true );
		});
		it('should knockback losing player, down, when they land on the same cell', function () {
			this.plays[0].endPosition = this.coord00;
			this.plays[0].startPosition = this.coord50; // vertical
			this.plays[0].playType    = 'attack';
			this.plays[1].endPosition = this.coord00;
			this.plays[1].startPosition = this.coord05; // horizontal
			this.plays[1].playType    = 'move';
			this.scoreStrategy.calculateScore( this.plays );
			expect( this.plays[0].endPosition.equals( this.coord00 )).toBe( true );
			expect( this.plays[1].endPosition.equals( this.coord01 )).toBe( true );
		});
		it('should knockback losing player, up, when they land on the same cell', function () {
			this.plays[0].startPosition = this.coord00; // top
			this.plays[0].playType      = 'move';       // to
			this.plays[0].endPosition   = this.coord50; // bottom
			this.plays[0].turnPoints    = 5;


			this.plays[1].startPosition = this.coord55; // right
			this.plays[1].playType      = 'move';       // to
			this.plays[1].endPosition   = this.coord50; // left
			this.plays[1].turnPoints    = 10;

			this.scoreStrategy.calculateScore( this.plays );
			expect( this.plays[0].endPosition.equals( this.coord40 )).toBe( true, "loser knocked back" );
			expect( this.plays[1].endPosition.equals( this.coord50 )).toBe( true, "winner keeps place" );
		});
		it('should knockback losing player, left, when they land on the same cell', function () {
			this.plays[0].startPosition = this.coord00; // top
			this.plays[0].playType      = 'move';       // to
			this.plays[0].endPosition   = this.coord50; // bottom
			this.plays[0].turnPoints    = 10;


			this.plays[1].startPosition = this.coord55; // right
			this.plays[1].playType      = 'move';       // to
			this.plays[1].endPosition   = this.coord50; // left
			this.plays[1].turnPoints    = 5;

			this.scoreStrategy.calculateScore( this.plays );
			expect( this.plays[0].endPosition.equals( this.coord50 )).toBe( true, "winner keeps place" );
			expect( this.plays[1].endPosition.equals( this.coord51 )).toBe( true, "loser knocked back" );
		});
		it('should knockback losing player, right, when they land on the same cell', function () {
			this.plays[0].endPosition       = this.coord00;
			this.plays[0].startPosition   = this.coord05; // horizontal
			this.plays[0].playType          = 'attack';
			this.plays[1].endPosition       = this.coord00;
			this.plays[1].startPosition   = this.coord50; // vertical
			this.plays[1].playType          = 'move';
			this.scoreStrategy.calculateScore( this.plays );
			expect( this.plays[0].endPosition.equals( this.coord00 )).toBe( true );
			expect( this.plays[1].endPosition.equals( this.coord10 )).toBe( true );
		});
	});
});

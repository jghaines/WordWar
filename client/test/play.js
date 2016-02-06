
describe('Play', function() {
	beforeEach( function(){
		this.p = { // parameters
			moveType: 			'move',
			word: 				'BEANS',
			wordValue: 			10,
			playRange: 			new CoordRange( new Coordinates(0, 1), new Coordinates(0, 5) ),
			newPosition: 		new Coordinates(0, 5),
			attackMultiplier: 	2,
			score: 				0 // not in constructor 
		}
		this.objectKeys = [ 'playRange', 'newPosition' ]; // object attributes that need .equals() comparison

		this.play = new Play(
			this.p['moveType'], this.p['word'], this.p['wordValue'], this.p['playRange'], this.p['newPosition'], this.p['attackMultiplier'] );
	});

	describe("#constructor(..)", function () {
		it('should set the properties', function () {
			var play = this.play;
			Object.keys( this.p ).forEach( (function (key) { 
				if ( this.objectKeys.indexOf( key ) >= 0 ) {
					expect( play[key].equals( this.p[key] )).toBe( true );
				} else {
					expect( play[key] ).toEqual( this.p[key], 'for Play[' + key+ ']' );
				}
			}).bind( this ));
		});
	});

	describe("#loadFromJson(.)", function () {
		it('should set the properties', function () {
			var play = new Play();
			var p = this.p;

			play.loadFromJson( JSON.parse(` {
				"player": 			0,
				"moveType": 		"move",
				"word": 			"BEANS",
				"wordValue": 		10,
				"playRange": 		{	"min":{"row":0,"col":1},
										"max":{"row":0,"col":5}	},
				"newPosition": 		{	"row":0,"col":5	},
				"attackMultiplier": 2,
				"score": 			0
				}`));

			Object.keys( this.p ).forEach( (function (key) { 
				if ( this.objectKeys.indexOf( key ) >= 0 ) {
					expect( play[key].equals( this.p[key] )).toBe( true );
				} else {
					expect( play[key] ).toEqual( this.p[key], 'for Play[' + key+ ']' );
				}
			}).bind( this ));
		});
	});

	describe("#cmp(.)", function () {
		it('should let attack beat move', function () {
			var playA = new Play(); playA.moveType = 'attack';
			var playB = new Play(); playB.moveType = 'move';
			expect( playA.cmp( playB )).toEqual( 1 );
			expect( playB.cmp( playA )).toEqual( -1 ); // reverse order
		});
		it('should let the longer score win for attack vs attack', function () {
			var playA = new Play(); playA.moveType = 'attack'; playA.score = 8;
			var playB = new Play(); playB.moveType = 'attack'; playB.score = 3;
			expect( playA.cmp( playB )).toEqual( 1 );
			expect( playB.cmp( playA )).toEqual( -1 ); // reverse order
		});
		it('should let the longer score win for move vs move', function () {
			var playA = new Play(); playA.moveType = 'move'; playA.score = 8;
			var playB = new Play(); playB.moveType = 'move'; playB.score = 3;
			expect( playA.cmp( playB )).toEqual( 1 );
			expect( playB.cmp( playA )).toEqual( -1 ); // reverse order
		});
		it('should let the longer word win for same moveType, score', function () {
			var playA = new Play(); playA.moveType = 'move'; playA.score = 8; playA.word = 'LONGER';
			var playB = new Play(); playB.moveType = 'move'; playB.score = 8; playB.word = 'SHORT';
			expect( playA.cmp( playB )).toEqual( 1 );
			expect( playB.cmp( playA )).toEqual( -1 ); // reverse order
		});
		it('should let the later word win for same moveType, score, wordLength', function () {
			var playA = new Play(); playA.moveType = 'move'; playA.score = 8; playA.word = 'ZZZZ';
			var playB = new Play(); playB.moveType = 'move'; playB.score = 8; playB.word = 'AAAA';
			expect( playA.cmp( playB )).toEqual( 1 );
			expect( playB.cmp( playA )).toEqual( -1 ); // reverse order
		});
		it('should tie for same', function () {
			var playA = new Play(); playA.moveType = 'move'; playA.score = 8; playA.word = 'WORD';
			var playB = new Play(); playB.moveType = 'move'; playB.score = 8; playB.word = 'WORD';
			expect( playA.cmp( playB )).toEqual( 0 );
			expect( playB.cmp( playA )).toEqual( 0 ); // reverse order
		});
	});
});

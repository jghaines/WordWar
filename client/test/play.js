
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
});

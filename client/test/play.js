
describe('Play', function() {
	beforeEach( function(){
		this.jsonPlay = { // JSON version for constructor
            gameId              : 'game-uuid',
			playerIndex         : 1,
            turnIndex           : 1,
            lost                : false,

            playComplete        : true,
			playType            : 'move',
			word                : 'BEANS',

			wordPoints              : 10,
            turnPoints              : 10,

			startAttackMultiplier   : 2,
			endAttackMultiplier     : 3,

			startTurnScore      : 100,
			endTurnScore        : 150,
            
			playRange           : new CoordRange( new Coordinates(0, 1), new Coordinates(0, 5) ),
			newPosition         : new Coordinates(0, 5),
		}
		this.objectKeys = [ 'playRange', 'newPosition' ]; // object attributes that need .equals() comparison
        this.expectedProperties = [
            'gameId',
            'playerIndex',
            'turnIndex',
            'lost',

            'playComplete',
            'playType',
            'word',
            
            'wordPoints',
            'turnPoints',

            'startAttackMultiplier',
			'endAttackMultiplier',

            'startTurnScore',
            'endTurnScore',
            
            'playRange',
            'newPosition'
        ];
        this.legacyProperties = [
            'score'                
        ];

		this.barePlay = new Play();
		this.play = new Play( this.jsonPlay );
    });

	describe("properties", function () {
		it('should have the expected properties', function () {
            this.expectedProperties.forEach( ((property)=> {
                expect( this.barePlay.hasOwnProperty( property ) ).toBe( true, `expeted object to have property ${ property }` );
                expect( this.play.hasOwnProperty( property ) ).toBe( true, `expeted object to have property ${ property }` );
            }).bind( this ));
        });
		it('should NOT have the legacy properties', function () {
            this.legacyProperties.forEach( ((property)=> {
                expect( this.barePlay.hasOwnProperty( property ) ).toBe( false, `expeted object to have property ${ property }` );
                expect( this.play.hasOwnProperty( property ) ).toBe( false, `expeted object to have property ${ property }` );
            }).bind( this ));
        });
    });

	describe("#constructor(..)", function () {
		it('should set the Play( { properties } ) passed', function () {
			Object.keys( this.jsonPlay ).forEach( (function (key) { 
				if ( this.objectKeys.indexOf( key ) >= 0 ) {
					expect( this.play[key].equals( this.jsonPlay[key] )).toBe( true );
				} else {
					expect( this.play[key] ).toEqual( this.jsonPlay[key], 'for Play[' + key+ ']' );
				}
			}).bind( this ));
		});
	});

	describe("#createNextTurnPlay(..)", function () {
		it('should set the previous Play( { properties } ) passed', function () {
            var nextTurn = this.play.createNextTurnPlay();
            expect( nextTurn.gameId ).toEqual( this.jsonPlay.gameId );
            expect( nextTurn.turnIndex ).toEqual( this.jsonPlay.turnIndex + 1 );  // next turnIndex
            expect( nextTurn.playerIndex ).toEqual( this.jsonPlay.playerIndex );

            expect( nextTurn.playComplete ).toEqual( false );

            expect( nextTurn.startTurnScore ).toEqual( this.jsonPlay.endTurnScore ); // endTurnScore -> startTurnScore
		});
	});
    
	describe("#loadFromGameInfo(..)", function () {
		it('should set the properties provided', function () {
            var play = new Play();
            play.loadFromGameInfo( 1, {
                gameId : 'game-uuid', 
                startGameScore : 50,
            });

            expect( play.gameId ).toEqual( 'game-uuid' );
            expect( play.turnIndex ).toEqual( 0 );
            expect( play.playerIndex ).toEqual( 1 );
            expect( play.lost ).toBe( false );
            
            expect( play.startAttackMultiplier ).toEqual( 0 );
            expect( play.startTurnScore ).toEqual( 50 );
		});
	});
    
	describe("#loadFromJson(..)", function () {
		it('should set the properties provided', function () {
            var play = new Play();
            play.loadFromJson(  this.jsonPlay );
			Object.keys( this.jsonPlay ).forEach( (function (key) { 
				if ( this.objectKeys.indexOf( key ) >= 0 ) {
					expect( this.play[key].equals( this.jsonPlay[key] )).toBe( true );
				} else {
					expect( this.play[key] ).toEqual( this.jsonPlay[key], 'for Play[' + key+ ']' );
				}
			}).bind( this ));
		});
	});

	describe("toJSON()", function () {
		it('should have the expected properties', function () {
            this.expectedProperties.forEach( ((property)=> {
                expect( this.play.toJSON().hasOwnProperty( property ) ).toBe( true, `expeted object to have property ${ property }` );
            }).bind( this ));
        });
		it('should NOT have the legacy properties', function () {
            this.legacyProperties.forEach( ((property)=> {
                expect( this.play.toJSON().hasOwnProperty( property ) ).toBe( false, `expeted object to have property ${ property }` );
            }).bind( this ));
        });
    });

	describe("#cmp(.)", function () {
		it('should let attack beat move', function () {
			var playA = new Play(); playA.playType = 'attack';
			var playB = new Play(); playB.playType = 'move';
			expect( playA.cmp( playB )).toEqual( 1 );
			expect( playB.cmp( playA )).toEqual( -1 ); // reverse order
		});
		it('should let the longer score win for attack vs attack', function () {
			var playA = new Play(); playA.playType = 'attack'; playA.wordPoints = 8;
			var playB = new Play(); playB.playType = 'attack'; playB.wordPoints = 3;
			expect( playA.cmp( playB )).toEqual( 1 );
			expect( playB.cmp( playA )).toEqual( -1 ); // reverse order
		});
		it('should let the longer score win for move vs move', function () {
			var playA = new Play(); playA.playType = 'move'; playA.wordPoints = 8;
			var playB = new Play(); playB.playType = 'move'; playB.wordPoints = 3;
			expect( playA.cmp( playB )).toEqual( 1 );
			expect( playB.cmp( playA )).toEqual( -1 ); // reverse order
		});
		it('should let the longer word win for same playType, score', function () {
			var playA = new Play(); playA.playType = 'move'; playA.wordPoints = 8; playA.word = 'LONGER';
			var playB = new Play(); playB.playType = 'move'; playB.wordPoints = 8; playB.word = 'SHORT';
			expect( playA.cmp( playB )).toEqual( 1 );
			expect( playB.cmp( playA )).toEqual( -1 ); // reverse order
		});
		it('should let the later word win for same playType, score, wordLength', function () {
			var playA = new Play(); playA.playType = 'move'; playA.wordPoints = 8; playA.word = 'ZZZZ';
			var playB = new Play(); playB.playType = 'move'; playB.wordPoints = 8; playB.word = 'AAAA';
			expect( playA.cmp( playB )).toEqual( 1 );
			expect( playB.cmp( playA )).toEqual( -1 ); // reverse order
		});
		it('should tie for same', function () {
			var playA = new Play(); playA.playType = 'move'; playA.wordPoints = 8; playA.word = 'WORD';
			var playB = new Play(); playB.playType = 'move'; playB.wordPoints = 8; playB.word = 'WORD';
			expect( playA.cmp( playB )).toEqual( 0 );
			expect( playB.cmp( playA )).toEqual( 0 ); // reverse order
		});
	});

	describe("#toPlayDescription(.)", function () {
		it('should describe a move', function () {
			var playA = new Play( { playType : 'move', word: 'SUGAR', turnPoints: 15 } );
			expect( playA.toPlayDescription() ).toEqual( 'Move: SUGAR +15' );
	    });
		it('should describe an attack', function () {
			var playA = new Play( { playType : 'attack', word: 'SUGAR', startAttackMultiplier : 2, turnPoints: 0 } );
			expect( playA.toPlayDescription() ).toEqual( 'Attack (x2): SUGAR +0' );
	    });
    });

	describe("#toPlayPointsInfo(.)", function () {
		it('should describe the points', function () {
			var playA = new Play( { playType : 'attack', word: 'SUGAR', startTurnScore: 5, wordPoints: 10, endTurnScore: 15 } );
			expect( playA.toPlayPointsInfo() ).toEqual( '5 + 10 = 15' );
    	});
	});
});

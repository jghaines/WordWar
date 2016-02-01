describe('GameController', function() {
	beforeEach(	function() {
		var remoteProxy = jasmine.createSpyObj( 'RemoteProxy', ['onStartGame', 'onStartTurn','onPlayReceived'] );
		var scoreStrategy = {};
		this.gameController = new GameController( remoteProxy, scoreStrategy );

		this.play = new Play( 'move', 'word', 10, { 
				min: new Coordinates( 0, 0 ),
				max: new Coordinates( 0, 3 ),
			}, 
			new Coordinates( 0, 3 ), 1 );

	});

	describe('#knockBackPlayer()', function () {
		it('should work on a left-right play', function () {
			this.play.playRange = { min: new Coordinates( 0, 0 ), max: new Coordinates( 0, 3 ) }
			this.play.newPosition = new Coordinates( 0, 3 );

			this.gameController.knockBackPlayer( this.play );
			expect( this.play.newPosition.row ).toEqual( 0 );
			expect( this.play.newPosition.col ).toEqual( 2 );

		});
	});

});

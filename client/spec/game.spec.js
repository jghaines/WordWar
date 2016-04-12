describe('GameController', function() {
	beforeEach(	function() {
		var remoteProxy = jasmine.createSpyObj( 'RemoteProxy', ['onStartGame', 'onStartTurn','onPlayReceived'] );
		var scoreStrategy = {};
		this.gameController = new GameController( remoteProxy, scoreStrategy );
	});
});

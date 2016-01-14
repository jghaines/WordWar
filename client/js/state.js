'use strict';

function StateContext(remote) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	// new game - callback from Remote proxy
	this.newGame = function(gameInfo) {
		this.log.info(this.constructor.name + '.newGame(.)');
		this._newGameCallbacks.fire(gameInfo);

		this._state.gameStart();
	}

	// new turn - callback from Remote proxy
	this.newTurn = function(turnInfo) {
		this.log.info(this.constructor.name + '.newTurn(.)');
		this._newTurnCallbacks.fire(turnInfo);
	}

	// local move - called by GameController
	this.localMove = function(localPlay) {
		this.log.info(this.constructor.name + '.localMove(.)');
		this.log.debug(this.constructor.name + '.localMove(', localPlay, ')');

		this._localPlay = localPlay; 
		this._remote.executeLocalPlay( localPlay );

		this._state.localMove();
	}

 	// remote move - callback from remote proxy
 	this.remoteMove = function(msg) {
 		this.log.info(this.constructor.name + '.remoteMove(.)');
 		this.log.debug(this.constructor.name + '.remoteMove(', msg, ')');

		this._remotePlay = new Play();
		this._remotePlay.loadFromJson( JSON.parse( msg ));

 		this._state.remoteMove();
 	}

 	// local & remove moves complete - callback from States
 	this.moveComplete = function(args) {
 		this.log.info( this.constructor.name + '.moveComplete(.)'); 		
 		this._moveCompleteCallbacks.fire(args);
 	}


	// callback from States
	this.setState = function(newState) {
 		this.log.debug(this.constructor.name + '.setState() - state =', newState);
		this._state = newState;
	}

	this.getLocalPlay = function() {
		return this._localPlay;
	}

	this.getRemotePlay = function() {
		return this._remotePlay;
	}

	// register callback
	this.onNewGame = function(callback) {
		this._newGameCallbacks.add(callback);
	}

	this.onNewTurn = function(callback) {
		this._newTurnCallbacks.add(callback);
	}

	// register callback
	this.onMoveComplete = function(callback) {
		this._moveCompleteCallbacks.add(callback);
	}

	// our buffer for most recent plays
	this._localPlay = {};
	this._remotePlay = {};

	this._newGameCallbacks = $.Callbacks();
	this._newTurnCallbacks = $.Callbacks();
	this._moveCompleteCallbacks = $.Callbacks();


	this._state = new StateWaitForGameStart( this );
	this._remote = remote;

	this._remote.onStartGame( (function(msg) { 
		this.newGame(msg);
	}).bind(this));

	this._remote.onStartTurn( (function(msg) { 
		this.newTurn(msg);
	}).bind(this));

	this._remote.onPlayReceived( (function(msg) { 
		this.remoteMove(msg);
	}).bind(this));
}


function StateWaitForGameStart( context ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	this.context = context;


	this.gameStart = function() {
		this.log.info(this.constructor.name, '-(gameStart)-> StateWaitForMove');
		context.setState( new StateWaitForMove( this.context ));
	}

	this.localMove = function() {
		throw this.constructor.name + '.localMove' + ' invalid state transition';
	}

	this.remoteMove = function() {
		throw this.constructor.name + '.remoteMove' + ' invalid state transition';
	}

	this.moveComplete = function() {
		throw this.constructor.name + '.moveComplete' + ' invalid state transition';
	}
}


function StateWaitForMove( context ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	this.context = context;

	this.localMove = function() {
		this.log.info(this.constructor.name, '-(localMove)-> StateWaitForRemote')
		context.setState( new StateWaitForRemote( this.context ));	
	}

	this.remoteMove = function() {
		this.log.info(this.constructor.name, '-(remoteMove)-> StateWaitForLocal')
		context.setState( new StateWaitForLocal( this.context ));	
	}

	this.moveComplete = function() {
		throw this.constructor.name + '.moveComplete' + ' invalid state transition';
	}
}

function StateWaitForRemote( context ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	this.context = context;

	this.localMove = function() {
		throw this.constructor.name + '.localMove' + ' invalid state transition';
	}

	this.remoteMove = function() {
		this.log.info(this.constructor.name, ' -(remoteMove)-> StateWaitForMove')
		context.moveComplete();
		context.setState( new StateWaitForMove( this.context ));	
	}

	this.moveComplete = function() {
		throw this.constructor.name + '.moveComplete' + ' invalid state transition';
	}
}


function StateWaitForLocal( context ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	this.context = context;

	this.localMove = function() {
		this.log.info(this.constructor.name, '-(localMove)-> StateWaitForMove')
		context.moveComplete();
		context.setState( new StateWaitForMove( this.context ));	
	}

	this.remoteMove = function() {
		throw this.constructor.name + '.remoteMove' + ' invalid state transition';
	}

	this.moveComplete = function() {
		throw this.constructor.name + '.moveComplete' + ' invalid state transition';
	}
}

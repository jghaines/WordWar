'use strict';

function StateContext(remote) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.INFO );

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
	this.localMove = function( play ) {
		this.log.info(this.constructor.name + '.localMove(.)');
		this.log.debug(this.constructor.name + '.localMove(', play, ')');

		this._plays[ play.playerIndex ] = play; 
		this._remote.executeLocalPlay( play );

		this._state.localMove();
	}

 	// remote move - callback from remote proxy
 	this.remoteMove = function( msg ) {
 		this.log.info(this.constructor.name + '.remoteMove(.)');
 		this.log.debug(this.constructor.name + '.remoteMove(', msg, ')');

		var play = new Play();
		play.loadFromJson( JSON.parse( msg ));
		this._plays[ play.playerIndex ] = play; 

 		this._state.remoteMove();
 	}

 	// local & remove moves complete - callback from States
 	this.endTurn = function(args) {
 		this.log.info( this.constructor.name + '.endTurn(.)'); 		
 		this._endTurnCallbacks.fire(args);
 	}


	// callback from States
	this.setState = function(newState) {
 		this.log.info(this.constructor.name + '.setState(' + newState.constructor.name + ')' );
		this._state = newState;

		this._statusUpdateCallbacks.fire( newState.statusMessage );
	}

	//
	// Accessors
	//
	this.getPlays = function() {
		return this._plays;
	}


	//
	// register callbacks
	//
	this.onNewGame = function(callback) {
		this._newGameCallbacks.add(callback);
	}

	this.onNewTurn = function(callback) {
		this._newTurnCallbacks.add(callback);
	}

	this.onendTurn = function(callback) {
		this._endTurnCallbacks.add(callback);
	}

	this.onStatusUpdate = function(callback) {
		this._statusUpdateCallbacks.add(callback);
		callback( this._state.statusMessage ); // give the caller the current status
	}

	// our buffer for most recent plays
	this._plays = [];

	this._newGameCallbacks = $.Callbacks();
	this._newTurnCallbacks = $.Callbacks();
	this._endTurnCallbacks = $.Callbacks();
	this._statusUpdateCallbacks = $.Callbacks();

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
	this.log.setLevel( log.levels.SILENT );

	this.context = context;

	this.statusMessage = "Waiting for opponent to join";


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

	this.endTurn = function() {
		throw this.constructor.name + '.endTurn' + ' invalid state transition';
	}
}


function StateWaitForMove( context ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.context = context;

	this.statusMessage = "Place your word";

	this.gameStart = function() {
		throw this.constructor.name + '.gameStart' + ' invalid state transition';
	}

	this.localMove = function() {
		this.log.info(this.constructor.name, '-(localMove)-> StateWaitForRemote')
		context.setState( new StateWaitForRemote( this.context ));	
	}

	this.remoteMove = function() {
		this.log.info(this.constructor.name, '-(remoteMove)-> StateWaitForLocal')
		context.setState( new StateWaitForLocal( this.context ));	
	}

	this.endTurn = function() {
		throw this.constructor.name + '.endTurn' + ' invalid state transition';
	}
}

function StateWaitForRemote( context ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.context = context;

	this.statusMessage = "Waiting for opponent's move";

	this.gameStart = function() {
		throw this.constructor.name + '.gameStart' + ' invalid state transition';
	}

	this.localMove = function() {
		throw this.constructor.name + '.localMove' + ' invalid state transition';
	}

	this.remoteMove = function() {
		this.log.info(this.constructor.name, ' -(remoteMove)-> StateWaitForMove')
		context.endTurn();
		context.setState( new StateWaitForMove( this.context ));	
	}

	this.endTurn = function() {
		throw this.constructor.name + '.endTurn' + ' invalid state transition';
	}
}


function StateWaitForLocal( context ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.context = context;

	this.statusMessage = "Place your word";

	this.gameStart = function() {
		throw this.constructor.name + '.gameStart' + ' invalid state transition';
	}

	this.localMove = function() {
		this.log.info(this.constructor.name, '-(localMove)-> StateWaitForMove')
		context.endTurn();
		context.setState( new StateWaitForMove( this.context ));	
	}

	this.remoteMove = function() {
		throw this.constructor.name + '.remoteMove' + ' invalid state transition';
	}

	this.endTurn = function() {
		throw this.constructor.name + '.endTurn' + ' invalid state transition';
	}
}

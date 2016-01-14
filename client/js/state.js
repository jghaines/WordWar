'use strict';

function StateContext(remote) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	// local move - called by GameController
	this.localMove = function(localPlay) {
		this.log.info(this.constructor.name + '.localMove(.)');
		this.log.debug(this.constructor.name + '.localMove(', localPlay, ')');

		this._localPlay = localPlay; 
		this._remote.executeLocalPlay( localPlay );

		this._state.localMove( this );
	}

 	// remote move - callback from remote proxy
 	this.remoteMove = function(msg) {
 		this.log.info(this.constructor.name + '.remoteMove(.)');
 		this.log.debug(this.constructor.name + '.remoteMove(', msg, ')');

		this._remotePlay = new Play();
		this._remotePlay.loadFromJson( JSON.parse( msg ));

 		this._state.remoteMove(this);
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
	this.onMoveComplete = function(callback) {
		this._moveCompletCallbacks.add(callback);
	}

 	// local & remove moves complete - callback from States
 	this.moveComplete = function(args) {
 		this.log.info(this.constructor.name + '.moveComplete(.)'); 		
 		this._moveCompletCallbacks.fire(args);
 	}


	// our buffer for most recent plays
	this._localPlay = {};
	this._remotePlay = {};


	this._moveCompletCallbacks = $.Callbacks();


	this._state = new StateInitial();
	this._remote = remote;

	this._remote.onPlayReceived( (function(msg) { 
		this.remoteMove(msg);
	}).bind(this));
}


function StateInitial() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	this.localMove = function(context) {
		this.log.info(this.constructor.name, '-(localMove)-> StateWaitForRemote')
		context.setState(new StateWaitForRemote());	
	}

	this.remoteMove = function(context) {
		this.log.info(this.constructor.name, '-(remoteMove)-> StateWaitForLocal')
		context.setState(new StateWaitForLocal());	
	}

	this.moveComplete = function(context) {
		throw this.constructor.name + '.moveComplete' + ' invalid state transition';
	}
}

function StateWaitForRemote() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	this.localMove = function(context) {
		throw this.constructor.name + '.localMove' + ' invalid state transition';
	}

	this.remoteMove = function(context) {
		this.log.info(this.constructor.name, ' -(remoteMove)-> StateInitial')
		context.moveComplete();
		context.setState(new StateInitial());	
	}

	this.moveComplete = function(context) {
		throw this.constructor.name + '.moveComplete' + ' invalid state transition';
	}
}


function StateWaitForLocal() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	this.localMove = function(context) {
		this.log.info(this.constructor.name, '-(localMove)-> StateInitial')
		context.moveComplete();
		context.setState(new StateInitial());	
	}

	this.remoteMove = function(context) {
		throw this.constructor.name + '.remoteMove' + ' invalid state transition';
	}

	this.moveComplete = function(context) {
		throw this.constructor.name + '.moveComplete' + ' invalid state transition';
	}
}



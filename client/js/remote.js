'use strict';


function RemoteProxy(socket) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );


	//
	// register callbacks
	//
	this.onStartGame = function(callback) {
		this.log.info( this.constructor.name + '.onNewGame(.) - callback registered');
		this._startGameCallbacks.add(callback);
	}

	this.onStartTurn = function(callback) {
		this.log.info( this.constructor.name + '.onStartTurn(.) - callback registered');
		this._startTurnCallbacks.add(callback);
	}

	this.onPlayReceived = function(callback) {
		this.log.info( this.constructor.name + '.onPlayReceived(.) - callback registered');
		this._playReceivedCallbacks.add(callback);
	}


	//
	// server message receieve event handlers, fire callbacks
	//
	this._startGame = function(msg) {
		this.log.info( this.constructor.name + '._startGame(.)');
		this.log.info( this.constructor.name, '_startGame( msg', msg);
		this._startGameCallbacks.fire( JSON.parse( msg ));
	}

	this._startTurn = function(msg) {
		this.log.info( this.constructor.name + '._startTurn(.)');
		this.log.info( this.constructor.name, '_startTurn( msg', msg);
		this._startTurnCallbacks.fire(msg);
	}

	this._playRecived = function(msg) {
		this.log.info( this.constructor.name + '._playRecived(.)');
		this.log.info( this.constructor.name, '_playRecived( msg', msg);
		this._playReceivedCallbacks.fire(msg);
	}

	// connection management event handlers 
	this._receiveUserid = function( msg ) {
		this.log.info( this.constructor.name + '._receiveUserid(.)');
		this.log.debug( this.constructor.name, '_receiveUserid( msg', msg, ')');

		// first time connection, take user id
		if ( this._userid === undefined ) {
			this._userid = msg.userId;

			// confirm new id with server
			this._socket.emit( 'player', { userId : this._userid } );
		} 

	}

	this._reconnect = function( msg ) {
		this.log.info( this.constructor.name + '._reconnect(.)');
		this.log.debug( this.constructor.name, '._reconnect( msg=', msg, ')' );

		// let the server know who we are
		this._socket.emit( 'player', { userId : this._userid } );
	}

	//
	// send local event to server
	//
	this.executeLocalPlay = function( localPlay ) {
		this.log.info( this.constructor.name + '.play(.)');
		this._socket.emit('play message', JSON.stringify( localPlay ));
	}

	//
	// Accessors
	//
	this.getLocalPlay = function() {
		return this._localPlay;
	}

	this.getRemotePlay = function() {
		return this._remotePlay;
	}

	// constructor code
	this._socket = socket;
	this._userid = undefined;
	this._player = 0;

	this._startGameCallbacks = $.Callbacks();
	this._startTurnCallbacks = $.Callbacks();
	this._playReceivedCallbacks = $.Callbacks();

	// event bindings - connection management 
	this._socket.on('userId', (function(msg) {
		this._receiveUserid(msg);
 	}).bind(this ));

	this._socket.on('reconnect', (function(msg) {
		this._reconnect(msg);
 	}).bind(this ));

	// event bindings - game events
	this._socket.on('new game', (function(msg){
		this._startGame(msg);
	}).bind( this ));

	this._socket.on('start turn', (function(msg){
		this._startTurn(msg);
	}).bind( this ));

	this._socket.on('play message', (function(msg) {
		this._playRecived(msg);
	}).bind( this ));


}

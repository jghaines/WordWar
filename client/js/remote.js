'use strict';


function RemoteController(socket) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	// register callback
	this.onPlayReceived = function(callback) {
		this.log.info( this.constructor.name + '.onPlayReceived(.)');
		this._socket.on('play message', (function(msg){
			this.log.debug('  RemoteController callback - msg = ', msg);
			callback(msg);
	 	}).bind(this) );
	}

	// register callback
	this.onNewGame = function(callback) {
		this.log.info( this.constructor.name + '.onNewGame(.)');
		this._socket.on('new game', (function(msg){
			this.log.debug('  RemoteController(new game) callback - we received new game message');
			callback(msg);
	 	}).bind(this) );
	}

	this.executeLocalPlay = function(localPlay) {
		this.log.info( this.constructor.name + '.play(.)');
		this._socket.emit('play message', JSON.stringify( localPlay ));
	}

	this.getLocalPlay = function() {
		return this._localPlay;
	}

	this.getRemotePlay = function() {
		return this._remotePlay;
	}

	// constructor code
	this._socket = socket;
	this._userid = 'unknown';
	this._player = 0;
}
'use strict';


function RemoteController(socket) {
	this.log = log.getLogger( this.constructor.name );
	log.setLevel( log.levels.DEBUG );

	// register callback
	this.onPlayReceived = function(callback) {
		this.log.info('RemoteController.onPlayReceived(.)');
		this._socket.on('play message', (function(msg){
			log.info('  RemoteController callback - we received remote message');
			this._remotePlay = msg;

			callback(msg);
	 	}).bind(this) );
	}

	this.play = function(word, score, playRange, newPosition) {
		this.log.info('RemoteController.play(.)');

		this._localPlay = { 
			player: 		this._player,
			word:			word,
			score:			score,
			playRange:		playRange,
			newPosition: 	newPosition
		};

		this._socket.emit('play message', this._localPlay);
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

	this._localPlay = {};
	this._remotePlay = {};
}
'use strict';


function RemoteController(socket) {

	// register callback
	this.onPlayReceived = function(callback) {
		this._socket.on('play message', function(msg){
			log.info('  RemoteController callback');
			this._remotePlay = msg;

			callback(msg);
	 	});
	}

	this.play = function(word, score, range, newPosition) {
		log.info('RemoteController.play(.)');

		this._localPlay = { 
			player: 		this._player,
			word:			word,
			score:			score,
			range:			range,
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
'use strict';


function RemoteController(socket) {

	this.play = function(word, score, range ) {
		log.info('RemoteController.play(.)');
		this._socket.emit('play message', { 
			player: this._player,
			word:	word,
			score:	score,
			range:	range
		}  );

	}

	this.playReceived = function(msg) {
		log.info('RemoteController.playReceived(msg='+msg+')');
	}

	// constructor code
	this._socket = socket;
	this._userid = 'unknown';
	this._player = 0;
	socket.on('play message', ( function(msg){
		log.info('  RemoteController callback');
		this.playReceived(msg);
 	}).bind(this) );

}
'use strict';

function AudioProxy() {
	this.audio = {
		'wau' : new Audio( '/audio/wau.mp3' ),
	};

	this._play = function( audioKey ) {
		this.audio[ audioKey ].play();
	}

	this.newGame = function() {
		this.audio['wau'].play();
	}

	this.endTurn = function() {
		this.audio['wau'].play();
	}
}

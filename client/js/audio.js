'use strict';

function AudioProxy() {
	this.audio = {
		'wau' 	: new Audio( '/audio/wau.mp3' ),
		'punch' : new Audio( '/audio/punch.mp3' ),
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

	this.move = function() {
		this.audio['wau'].play();
	}

	this.attack = function() {
		this.audio['punch'].play();
	}
}

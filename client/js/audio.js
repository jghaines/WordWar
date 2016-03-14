'use strict';

function AudioProxy() {
	this.audio = { // eager-load the audio
        'bonk'              : new Audio( '/audio/bonk.mp3' ),
        'loseRetro'         : new Audio( '/audio/loseRetro.mp3' ),
        'mouseClick'        : new Audio( '/audio/mouseClick.mp3' ),
        'pickup'            : new Audio( '/audio/pickup.mp3' ),
		'punch'             : new Audio( '/audio/punch.mp3' ),
        'putdown'           : new Audio( '/audio/putdown.mp3' ),
        'putdownmultiple'   : new Audio( '/audio/putdownmultiple.mp3' ),
		'wau'               : new Audio( '/audio/wau.mp3' ),
        'winSpacey'         : new Audio( '/audio/winSpacey.mp3' ),
	};

	this._play = function( audioKey ) {
		this.audio[ audioKey ].play();
	}

	this.newGame = function() {
		this.audio['wau'].play();
	}
    
    this.selectTile = function() {
		this.audio['pickup'].play();
	}

	this.placeTile = function() {
		this.audio['putdown'].play();
	}

	this.resetWord = function() {
		this.audio['putdownmultiple'].play();
	}

    this.invalidWord = function() {
		this.audio['bonk'].play();
	}

    this.playWord = function() {
		this.audio['mouseClick'].play();
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

	this.win = function() {
		this.audio['winSpacey'].play();
	}

	this.lose = function() {
		this.audio['loseRetro'].play();
	}
}

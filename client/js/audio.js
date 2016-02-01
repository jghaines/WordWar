'use strict';

function AudioProxy() {
	this.audio = {
		'endTurn' : new Audio( '/audio/endturn.mp3' ),
	};

	this._play = function( audioKey ) {
		this.audio[ audioKey ].play();
	}

	this.endTurn = function() {
		this.audio['endTurn'].play();
	}
}

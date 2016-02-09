'use strict';

var UUID = require('node-uuid');

module.exports = class Player {

	constructor( userId, client ) {
		this.userId = userId;
		this.client = client;
	}

	setIndex( playerIndex ) {
		this.playerIndex = playerIndex;
	}
	
	setGame( gameId ) {
		this.gameId = gameId;
	}
}

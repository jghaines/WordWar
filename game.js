'use strict';

var UUID = require('node-uuid');

module.exports = class Game {

	constructor( board ) {
		this.gameId = UUID();
		this.playerCount = 2;
		this.players = [];

		this.startScore = 0;
		this.turnIndex = 0;
		this.playsThisTurn = 0;
		this.finished = false;

		this.board = board;
		this.letterCount = 10;
		this.minVowels = 2;
		this.maxVowels = 8;
	}

	toJSON() {
		return {
			gameId 		: this.gameId,
			board 		: this.board,
			letterCount : this.letterCount,
			startScore  : this.startScore,
			playerCount : this.playerCount,
		}
	}

	addPlayer( player ) {
		if ( this.players.length >= this.playerCount ) {
			throw new Error( this.constructor.name + '.addPlayer() - maximum number of players exceeded' );
		}
		var playerIndex = this.players.length;

		player.setIndex( playerIndex );
		player.setGame( this );
		this.players.push( player );
	}
}

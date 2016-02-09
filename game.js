'use strict';

var UUID = require('node-uuid');

module.exports = class Game {

	constructor( board ) {
		this.gameId = UUID();
		this.maxPlayers = 2;
		this.players = [];

		this.startScore = 0;
		this.turn = 0;
		this.playsThisTurn = 0;
		this.finished = false;

		this.board = board;
		this.letterCount = 10;
		this.minVowels = 2;
		this.maxVowels = 8;
	}

	addPlayer( player ) {
		if ( this.players.length >= this.maxPlayers ) {
			throw new Error( this.constructor.name + '.addPlayer() - maximum number of players exceeded' );
		}
		var playerIndex = this.players.length;

		player.setIndex( playerIndex );
		player.setGame( this );
		this.players.push( player );
	}
}

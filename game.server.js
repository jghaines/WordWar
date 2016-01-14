'use strict';



var
    gameServer = module.exports = { games : [] },
    UUID       = require('node-uuid');


gameServer.log = require('loglevel');
gameServer.log.setLevel('INFO');

gameServer.findGame = function(player) {
	this.log.debug(' gameServer.findGame() - games.length', this.games.length );

	var joinedGame = false;
	if ( this.games.length > 0 ) {

		for( var gameIndex = 0; gameIndex < this.games.length; ++gameIndex ) {
			var game = this.games[gameIndex];

			if ( game.players.length < 2 ) {
				game.players.push( player );
				player.game = game;
				this.log.info('G', game.id, 'P[1]', player.userid, 'joined game' );
				this.startGame(game);

				joinedGame = true;
				continue;
			}
		}
	}

	if ( ! joinedGame ) {
		this.createGame(player);
	}
}

gameServer.createGame = function(player) {

	var newGame = {
	    id : 			UUID(),
	    players: 		[ player ],
	    turn: 			0,
	    board: 			'./boards/1.html',
		letterCount: 	10
	};

	player.game = newGame;

	this.log.info('G', newGame.id, 'P[0]', player.userid, 'created game' );

	this.games.push(newGame);
}

gameServer.startGame = function(game) {
	this.log.info('G', game.id, 'started' );

	for ( var i = 0; i < game.players.length; ++i ) {
		game.players[i].emit( 'new game', JSON.stringify( game, ['board', 'letterCount'] ));
	}
}

gameServer.startTurn = function(game) {
	this.log.info('G', game.id, ' start turn ' );

	var msg = {
		turnNumber: game.turn,
		letters: Array.from(Array( game.letterCount )).map( () => 'X' )
	}

	++game.turn;

	for ( var i = 0; i < game.players.length; ++i ) {
		game.players[i].emit('new turn', msg);
	}
}

gameServer.onMessage = function(player, msg) {
	var game = player.game;

	for ( var i = 0; i < game.players.length; ++i ) {
		if ( game.players[i] != player ) {
			this.log.info('G', game.id, 'P['+(1-i)+']', player.userid, '-send move-> P['+i+']', game.players[i].userid );
			game.players[i].emit('play message', msg);
		}
	}

}

'use strict';



var
    gameServer = module.exports = { games : [] },
    UUID       = require('node-uuid'),
    letterbag  = require('./wordyLetters.js');

gameServer.log = require('loglevel');
gameServer.log.setLevel('INFO');

gameServer.defaultBoard = '1.html';
if( process.argv.length > 2 ) {
	gameServer.defaultBoard = process.argv[2];
	gameServer.log.info('Default board:', gameServer.defaultBoard);
}


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
	    startScore: 	50,
	    turn: 			0,
	    playsThisTurn: 	0,
	    board: 			'./boards/' + gameServer.defaultBoard,
		letterCount: 	10
	};

	player.game = newGame;

	this.log.info('G', newGame.id, 'P[0]', player.userid, 'created game' );

	this.games.push(newGame);
}

gameServer.startGame = function(game) {
	this.log.info('G', game.id, 'started' );

	for ( var i = 0; i < game.players.length; ++i ) {
		game.players[i].emit( 'new game', JSON.stringify( game, ['board', 'letterCount', 'startScore'] ));
	}

	this.nextTurn(game);
}

gameServer.nextTurn = function(game) {
	var msg = {
		turnNumber: game.turn,
		letters: Array.from(Array( game.letterCount )).map( () =>  letterbag.getLetter() )
	}

	++game.turn;
	game.playsThisTurn = 0;

	this.log.info('G', game.id, 'start turn[' + msg.turnNumber + ']', msg.letters );
	for ( var i = 0; i < game.players.length; ++i ) {
		game.players[i].emit('start turn', msg);
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

	++game.playsThisTurn;
	if ( game.playsThisTurn >= game.players.length ) {
		this.nextTurn(game);
	}

}

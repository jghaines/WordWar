'use strict';



var
    gameServer = module.exports = { games : [] },
    UUID       = require('node-uuid'),
    letterbag  = require('./wordyLetters.js');

gameServer.log = require("loglevel").getLogger("gameServer.log");
gameServer.log.setLevel('DEBUG');

gameServer.logSummary = require("loglevel").getLogger("gameServer.logSummary");;
gameServer.logSummary.setLevel('SILENT');

gameServer.defaultBoard = '1.html'; // default

if (  undefined !== process.env.BOARD_NAME ) { // override if (heroku) ENVironment variable given
	gameServer.defaultBoard = process.env.BOARD_NAME;
}

if ( process.argv.length > 2 ) { // override if command line given
	gameServer.defaultBoard = process.argv[2];
}
gameServer.log.info('Default board:', gameServer.defaultBoard);


gameServer.findExistingGameForUserId = function( userId, client ) {
	this.log.info( this.constructor.name + '.findExistingGameForUserId(..)' );

	for (var i = this.games.length - 1; i >= 0; i--) {
		var game = this.games[i];
		if ( ! game.finished ) {
			for (var i = game.players.length - 1; i >= 0; i--) {
				var player = game.players[i]
				if ( player.userId === userId ) {
					// reconnection - attach client to existing game
					this.log.debug( this.constructor.name + '.findExistingGameForUserId(..) - found!' );
					player.client = client;
					player.client.game = game;
					return true;
				}
			}
		}
	}
	return false;
}

gameServer.findPendingGame = function( userId, client ) {
	this.log.info( this.constructor.name + '.findPendingGame(..)' );
	this.log.debug( this.constructor.name, '.findPendingGame( userId= ', userId, ', client=.)' );

	for ( var i = this.games.length - 1; i >= 0; i-- ) {
		var game = this.games[i];
		if ( game.players.length < 2 ) {
			var player = { userId: userId, client : client }
			game.players.push( player );
			this.logSummary.info('G', game.id, 'P[1]', player.userId, 'joined game' );
			this.startGame(game);

			return true;
		}
	}
	return false;
}

gameServer.findGame = function( userId, client ) {
	this.log.info( this.constructor.name + ' gameServer.findGame(..)' );
	this.log.debug( this.constructor.name, ' gameServer.findGame( userId= ', userId, ', client=.)' );

	if ( ! this.findExistingGameForUserId( userId, client )) {
		if ( ! this.findPendingGame( userId, client )) {
			this.createGame( userId, client );
		}
	}
}

gameServer.createGame = function( userId, client ) {
	this.log.info( this.constructor.name + '.createGame(..)' );
	this.log.debug( this.constructor.name, '.createGame( userId= ', userId, ', client=.)' );

	var player = { userId: userId, client : client };

	var newGame = {
	    id : 			UUID(),
	    players: 		[ player ],
	    startScore: 	0,
	    turn: 			0,
	    playsThisTurn: 	0,
	    finished: 		false, 
	    board: 			'./boards/' + gameServer.defaultBoard,
		letterCount: 	10
	};

	this.logSummary.info('G', newGame.id, 'P[0]', player.userId, 'created game' );

	this.games.push(newGame);
}

gameServer.startGame = function(game) {
	this.log.debug( this.constructor.name, '.startGame(.)' );

	this.logSummary.info('G', game.id, 'started' );

	for ( var i = 0; i < game.players.length; ++i ) {
		game.players[i].client.game = game;
		game.players[i].client.emit( 'new game', JSON.stringify( game, ['board', 'letterCount', 'startScore'] ));
	}

	this.nextTurn(game);
}

gameServer.nextTurn = function(game) {
	this.log.debug( this.constructor.name, '.nextTurn(.)' );

	var msg = {
		turnNumber: game.turn,
		letters: Array.from(Array( game.letterCount )).map( () =>  letterbag.getLetter() )
	}

	++game.turn;
	game.playsThisTurn = 0;

	this.logSummary.info('G', game.id, 'start turn[' + msg.turnNumber + ']', msg.letters );
	for ( var i = 0; i < game.players.length; ++i ) {
		game.players[i].client.emit('start turn', msg);
	}

}

gameServer.onConnectMessage = function(player, msg) {
	this.log.debug( this.constructor.name, '.onConnectMessage(..)' );
}

gameServer.onPlayMessage = function(player, msg) {
	this.log.debug( this.constructor.name, '.onPlayMessage(.)' );

	var game = player.game;

	for ( var i = 0; i < game.players.length; ++i ) {
		if ( game.players[i].userId != player.userId ) {
			this.logSummary.info('G', game.id, 'P['+(1-i)+']', player.userId, '-send move-> P['+i+']', game.players[i].userId );
			game.players[i].client.emit('play message', msg);			
		}
	}

	++game.playsThisTurn;
	if ( game.playsThisTurn >= game.players.length ) {
		this.nextTurn(game);
	}

}

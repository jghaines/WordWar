'use strict';


const LetterGenerator = require('./wordyLetters.js');
const Game = require('./game.js');
const Player = require('./player.js');
const JsonDecorator = require('./json.decorator.js');

var
    gameServer = module.exports = { games : [] },
    UUID       = require('node-uuid');

gameServer.log = require("loglevel").getLogger("gameServer.log");
gameServer.log.setLevel('SILENT');

gameServer.logSummary = require("loglevel").getLogger("gameServer.logSummary");
gameServer.logSummary.setLevel('INFO');


gameServer._letterGenerator = new LetterGenerator();

gameServer.defaultBoard = '1.html'; // default

if (  undefined !== process.env.BOARD_NAME ) { // override if (heroku) ENVironment variable given
	gameServer.defaultBoard = process.env.BOARD_NAME;
}

if ( process.argv.length > 2 ) { // override if command line given
	gameServer.defaultBoard = process.argv[2];
}
gameServer.log.info('Default board:', gameServer.defaultBoard);


gameServer._vowelCount = function( letters ) {
	var vowels = 'AEIOU';
	var vowelCount = 0;
	letters.split('').forEach( function( letter ) {
		if ( vowels.indexOf( letter ) >= 0 ) {
			++vowelCount;
		}
	});

	return vowelCount;
}

gameServer._vowelCountChecker = function( letters, minVowels, maxVowels ) {
	var vowelCount = this._vowelCount( letters );
	return ( vowelCount >= minVowels && vowelCount <= maxVowels );
}



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
			var player = new Player( userId, client );
			game.addPlayer( player );
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

	var player = new Player( userId, client );

	var newGame = new Game( './boards/' + gameServer.defaultBoard );
	newGame.addPlayer( player );

	this.logSummary.info('G', newGame.id, 'P[0]', player.userId, 'created game' );

	this.games.push(newGame);
}

gameServer.startGame = function(game) {
	this.log.info( this.constructor.name, '.startGame(.)' );

	this.logSummary.info('G', game.id, 'started' );

	for ( var i = 0; i < game.players.length; ++i ) {
		var gameJson =  JSON.stringify( new JsonDecorator( game.toJSON(),  { playerIndex : i }));
		this.log.debug( this.constructor.name, '.startGame() - gameJson = ', gameJson );

		game.players[i].client.game = game;
		game.players[i].client.emit( 'new game', gameJson );
	}

	this.nextTurn(game);
}

gameServer.nextTurn = function(game) {
	this.log.debug( this.constructor.name, '.nextTurn(.)' );

	var msg = {
		turnNumber: game.turn,
		letters: this._letterGenerator.getLetters( game.letterCount, (function(letters) {
				return this._vowelCountChecker( letters, game.minVowels, game.maxVowels );
			}).bind( this ))
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

"use strict";

function GameListController( gameListView ) {
	this.log = log.getLogger( this.constructor.name );

    this.setRemote = function( remoteProxy ) {
        this._remoteProxy = remoteProxy;
        this._remoteProxy.on( this._remoteProxy.Event.GAME_LIST, this._populateGameList.bind( this ));
    }

    this.setVisibility = function( isVisible ) {
        this._gameListView.setVisibility( isVisible );
    }

    this.getGames = function() {
        this.log.info(this.constructor.name + '.getGames()');
        this._remoteProxy.getGamesForPlayer();
    }
    
    this._populateGameList = function( gameList ) {
        this.log.info(this.constructor.name + '._populateGameList()');
        const playerId = this._remoteProxy.playerId; 
        
        this._gameListView.clearGames()
        this._gameListView.appendNewGame();

        gameList
            .map( game => this._gameToGameInfo( game, this._remoteProxy.playerId ))
            .sort( this._gameSort )
            .forEach( gameInfo => this._gameListView.appendGame( gameInfo ) );
    }
    /**
     * @returns simple gameInfo object suitable for list population
     */
    this._gameToGameInfo = function( game ) {
        this.log.info(this.constructor.name + '._gameToGameInfo()');
        const minTurnIndex = Math.min.apply( null, game.lastPlayedTurnIndexList );

        if ( game.playerIdList.length > game.playerCount ) {
            log.error( this.constructor.name, `populateGameList() - game.playerIdList.length=${ game.playerIdList.length } > playerCount=${ game.playerCount } for gameId=${ game.gameId }`);
            return null; 
        }
        
        var playerIndex = -1;
        var opponentId = null;
        game.playerIdList.forEach( ( playerIdInList, index ) => {
            if ( playerIdInList === this._remoteProxy.playerId ) {
                playerIndex = index;
            } else {
                opponentId = playerIdInList;
            }
        });
        if ( playerIndex < 0 ) {
            log.warn( this.constructor.name, "populateGameList() - Found game we aren't in - gameId =", game.gameId );
            return null; 
        }
        
        const ourTurnIndex = game.lastPlayedTurnIndexList[ playerIndex ];
        game.isOurTurn = ( ourTurnIndex === minTurnIndex );
        const whoseTurn = ( game.isOurTurn ? "Your turn" : "Opponent's turn" );
        const opponentInfo = this._remoteProxy.players[ opponentId ];
        
        return {
            gameId          : game.gameId,
            turnNumber      : minTurnIndex + 2,
            isOurTurn       : game.isOurTurn,
            whoseTurn       : whoseTurn,
            opponentName    : ( opponentInfo && opponentInfo.wwNickname ? opponentInfo.wwNickname : 'Opponent' ),
            opponentPicture : ( opponentInfo && opponentInfo.picture ? opponentInfo.picture : this._remoteProxy.defaultPicture )
        };
    }

    this._gameSort = function( a, b ) {
        if ( a.isOurTurn != b.isOurTurn ) {
            return ( a.isOurTurn ? -1 : 1 );
        } else if ( a.turnNumber != b.turnNumber ) {
            return ( a.turnNumber < b.turnNumber ? -1 : 1 );
        } else {
            return ( a.gameId < b.gameId ? -1 : 1 );
        }
    }
    
    this._gameSelected = function( gameId ) {
        this.emit( 'GAME_SELECTED', gameId );
    }
    
    this._newGame = function() {
        this.emit( 'NEW_GAME' );
    }
    
    this._gameListView = gameListView;

    this._gameListView.on( 'NEW_GAME', this._newGame.bind(this) );
    this._gameListView.on( 'GAME_SELECTED', this._gameSelected.bind(this) );
}

// make the class an EventEmitter
GameListController.prototype = Object.create(EventEmitter.prototype);


function GameListView() {
	this.log = log.getLogger( this.constructor.name );

    this.setVisibility = function( isVisible ) {
        this.log.info(this.constructor.name + '.setVisibility(.)');

        if ( isVisible ) {
            this._ui.show();
        } else {
            this._ui.hide();
        }
    }

    this.clearGames = function() {
        this.log.info(this.constructor.name + '.clearGames()');
        this._ui.empty();
    }
    
    this.appendNewGame = function( gameInfo ) {
        this.log.info(this.constructor.name + '.appendNewGame()');
        
        // this shouldn't be needed
        this._ui = $( '.game-list' );

        var gameItemUi = $("<div>", { class: "new-game" }).append(
            $( '<span>', { class: "new-game" } )
        )
        .click( () => {
            this.emit( 'NEW_GAME' );
        })
        .appendTo( this._ui );
    }
    
    this.appendGame = function( gameInfo ) {
        this.log.info(this.constructor.name + '.appendGame()');

        if ( !gameInfo ) return;

        // this shouldn't be needed
        this._ui = $( '.game-list' );
        
        var gameItemUi = $("<div>", {class: "game-info", id : gameInfo.gameId }).append(
            $("<img>", {class: "avatar", src : gameInfo.opponentPicture }),
            $("<span>", {class: "opponent-name"}).text(
                gameInfo.opponentName
            ),
            $("<span>", {class: "turn-info"}).append(
                $("<span>", {class: "turn-number"}).text(
                    gameInfo.turnNumber
                ),
                $("<span>", {class: "whose-turn"}).text(
                    gameInfo.whoseTurn
                )
            )
        )
        .click( () => {
            this.emit( 'GAME_SELECTED', gameInfo.gameId );
        })
        .appendTo( this._ui );
    }
    
    this._ui = $( '.game-list' );
}

// make the class an EventEmitter
GameListView.prototype = Object.create(EventEmitter.prototype);

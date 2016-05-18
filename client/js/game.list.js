"use strict";

function GameListController( remoteProxy, gameListView ) {
	this.log = log.getLogger( this.constructor.name );

    this.getGames = function() {
        this.log.info(this.constructor.name + '.getGames()');
        this._remoteProxy.getGamesForPlayer();
    }
    
    this._populateGameList = function( gameList ) {
        this.log.info(this.constructor.name + '._populateGameList()');
        const playerId = this._remoteProxy.playerId; 
        
        gameList
            .map( game => this._gameToGameInfo( game, this._remoteProxy.playerId ))
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
        const whoseTurn = ( ourTurnIndex === minTurnIndex ? "Your turn" : "Opponent's turn" );
        const opponentInfo = this._remoteProxy.players[ opponentId ];
        
        return {
            gameId          : game.gameId,
            turnNumber      : minTurnIndex + 2,
            whoseTurn       : whoseTurn,
            opponentName    : ( opponentInfo && opponentInfo.wwNickname ? opponentInfo.wwNickname : 'Opponent' ),
            opponentPicture : ( opponentInfo && opponentInfo.picture ? opponentInfo.picture : this._remoteProxy.defaultPicture )
        };
    }
    
    this._loadGame = function( gameId ) {
        console.log( gameId );
    }
    
    
    this._remoteProxy = remoteProxy;
    this._gameListView = gameListView;

    this._gameListView.on( 'CLICKED', this._loadGame.bind(this) );
    this._remoteProxy.on( this._remoteProxy.Event.GAME_LIST, (function(msg) {
        this._populateGameList( msg );
	}).bind(this));
}

function GameListView() {
	this.log = log.getLogger( this.constructor.name );

    this.clearGames = function() {
        this.log.info(this.constructor.name + '.clearGames()');
        this._ui.empty();
    }
    
    this.appendGame = function( gameInfo ) {
        this.log.info(this.constructor.name + '.appendGame()');

        if ( !gameInfo ) return;
        
        $("<div>", {class: "game-info", id : gameInfo.gameId }).append(
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
            console.log( gameInfo.gameId );
            this.emit( 'CLICKED', gameInfo.gameId );
        })
        .appendTo( this._ui );
    }
    

    this._ui = $( '.game-list' );
}

// make the class an EventEmitter
GameListView.prototype = Object.create(EventEmitter.prototype);

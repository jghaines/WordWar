"use strict";

function GameListController( remoteProxy, gameListView ) {
	this.log = log.getLogger( this.constructor.name );

    this.getGames = function() {
        this._remoteProxy.getGamesForPlayer( ( err, gameList ) => {
            this.populateGameList( gameList );
        }); 
    }
    
    
    
    this.populateGameList = function( gameList ) {
        const playerId = this._remoteProxy.playerId; 
        
        gameList
            .map( game => this._gameToGameInfo( game, this._remoteProxy.playerId ))
            .forEach( gameInfo => this._gameListView.appendGame( gameInfo ) );
    }
    /**
     * @returns simple gameInfo object suitable for list population
     */
    this._gameToGameInfo = function( game ) {
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
            turnNumber : minTurnIndex + 2,
            whoseTurn : whoseTurn,
            opponentPicture : ( opponentInfo ? opponentInfo.picture : this._remoteProxy.defaultPicture )
        };
    }
    
    this._remoteProxy = remoteProxy;
    this._gameListView = gameListView;
}

function GameListView() {
	this.log = log.getLogger( this.constructor.name );

    this.clearGames = function() {
        this._ui.empty();
    }
    
    this.appendGame = function( gameInfo ) {
        if ( !gameInfo ) return;
        
        $("<div>", {class: "game-info"}).append(
            $("<img>", {class: "avatar", src : gameInfo.opponentPicture }),
            $("<span>", {class: "turn-number"}).text(
                gameInfo.turnNumber
            ),
            $("<span>", {class: "whose-turn"}).text(
                gameInfo.whoseTurn
            )
        ).appendTo( this._ui );
    }
    

    this._ui = $( '.game-list' );
}

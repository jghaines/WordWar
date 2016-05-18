'use strict';

describe('GameListController', () => {

    const playerId = 'player-001';
    const players  = {
        'player-001' : { playerId : 'player-001' },
        'player-002' : { playerId : 'player-002' },
    };

    const gameId = 'game-001';
    const game = {
        gameId : gameId,
        playerCount : 2,
        playerIdList : [ playerId, 'player-002' ],
        lastPlayedTurnIndexList : [ -1, -1 ]
    };

    const _remoteStub = {
        playerId : playerId,
        players  : players
    };    
    const glc = new GameListController( _remoteStub );
    
	describe("_gameToGameInfo", () => {
		it( "should return null if we aren't in the game", () => {
            var game_notIn = Object.assign( {}, game );
            game_notIn.playerIdList = [ 'player-100', 'player-200' ];
            game_notIn.gameId += '-notIn';
            
            var result = glc._gameToGameInfo( game_notIn );
            expect( result ).toBe( null );
        });
		it( "should return null if game is overpopulated", () => {
            var game_overfull = Object.assign( {}, game );
            game_overfull.playerIdList = game.playerIdList.concat( 'player-100' );
            game_overfull.gameId += '-overfull';
            
            var result = glc._gameToGameInfo( game_overfull );
            expect( result ).toBe( null );
        });
        describe("whoseTurn", () => {
            it( "should set to 'Your turn' at start of game", () => {
                var game_turn = Object.assign( {}, game );
                game_turn.lastPlayedTurnIndexList = [ -1, -1 ];
                game_turn.gameId += '-not-started';
                
                var result = glc._gameToGameInfo( game_turn );
                expect( result.whoseTurn ).toEqual( 'Your turn' );
            });
            it( "should set to 'Your turn' if opponent has played", () => {
                var game_turn = Object.assign( {}, game );
                game_turn.lastPlayedTurnIndexList = [ -1, 0 ];
                game_turn.gameId += '-opponent-played';
                
                var result = glc._gameToGameInfo( game_turn );
                expect( result.whoseTurn ).toEqual( 'Your turn' );
            });
            it( "should set to 'Opponent's turn' if we have played", () => {
                var game_turn = Object.assign( {}, game );
                game_turn.lastPlayedTurnIndexList = [ 0, -1 ];
                game_turn.gameId += '-we-played';
                
                var result = glc._gameToGameInfo( game_turn );
                expect( result.whoseTurn ).toEqual( "Opponent's turn" );
            });
        });
    });
});

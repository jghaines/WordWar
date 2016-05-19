'use strict';


var auth0 = new Auth0({
    domain:       ENV.auth0.domain,
    clientID:     ENV.auth0.accountClientId,
    callbackOnLocationHash: true
});

function RemoteMediator( getGameForId ) {

    this.setRemote = function( remote ) {
        this._remote.on( this._remote.Event.GAME_INFO, this._receiveGameInfo.bind( this ));
        this._remote.on( this._remote.Event.PLAY_INFO, this._receivePlayList.bind( this ));
        this._remote.on( this._remote.Event.TURN_INFO, this._receiveTurnList.bind( this ));
    }
    this._receiveGameInfo = function( gameInfo ) {
        if ( typeof gameInfo != 'string' ) throw new TypeError( 'Expected gameInfo.gameId parameter');
        this._getGameForId( gameInfo.gameId );
    }
    this._receivePlayList = function( playList ) {
        this._getGameForId( List[0].gameId );        
    }
    this._receiveTurnList = function( turnList ) {
        this._getGameForId( List[0].gameId );        
    }
    this._remote = null;   
    this._getGameForId = getGameForId;
}

function MainController() {

    function login( idToken, userId ) {
        var socket = io( webSocketUrl );
        this.remote = new RemoteProxy( idToken, userId, ENV.webSocketUrl, ENV.restBaseUrl );
        this._remoteMediator.setRemote( this.remote );
        this._gameListController.setRemote( this.remote );
    }

    this.getGameForId = function( gameId ) {
        console.log(`loadGame( gameId: ${ gameId } )`);
        var game = this.gameMap[ gameId ];
        if ( ! game ) {
            this.gameMap[ gameId ] = this.createGame( gameId );
        }
        return game;
    }

    this.createNewGame = function() {
        
        // get ourselves a game
        this._remote.getGame();
    }


    function createGame() {
        var attackRangeStrategy = new CompositeAttackRangeStrategy( [
            { from:  1, to: 99, strategy: new OverlappingAttackRangeStrategy() },
            { from:  6, to:  7, strategy: new RadiusAttackRangeStrategy(1) },
            { from:  8, to:  9, strategy: new RadiusAttackRangeStrategy(2) },
            { from: 10, to: 99, strategy: new RadiusAttackRangeStrategy(3) },
        ]);

        var endTurnStrategy  = new CompositeStrategy( [
            new TurnPointsEqualsWordPointsStrategy(),
            new WordLengthBonusStrategy( [
                { from:  1, to:  1, bonus: 1 },
                { from:  2, to:  2, bonus: 2 },
                { from:  3, to:  3, bonus: 3 },
                { from:  4, to:  4, bonus: 4 },
                { from:  5, to:  5, bonus: 5 },
                { from:  6, to:  6, bonus: 6 },
                { from:  7, to:  7, bonus: 7 },
                { from:  8, to:  8, bonus: 8 },
                { from:  9, to:  9, bonus: 9 },
                { from: 10, to: 99, bonus: 20 },
            ]),
            new ApplyAttackMulitiplierStrategy(),
            
            // turn victory conditions
            new IfThenStrategy( {
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'move', 'move' ] ),
                thenDo : []
            }),
            new IfThenStrategy( { 
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'attack', 'move' ] ),
                thenDo : new AttackWinsMetaStrategy( {
                    winner : _ => { return 0 },
                    loser  : _ => { return _.loser.turnPoints - _.winner.turnPoints }
                })
            }),
            new IfThenStrategy( { 
                ifTrue : new PlayTypeCombinationConditionalStrategy( [ 'attack', 'attack' ] ),
                thenDo : new HighScoreWinsMetaStrategy( {
                    winner : _ => { return 0 },
                    loser  : _ => { return -1 * _.winner.turnPoints },
                })
            }),                    
            new SetEndTurnStrategy(),
            new MinMaxEndTurnStrategy( -999, 800 ),
            new EndGameLowWaterMarkLoserStrategy( 0 ),
            new EndGameMaxTurnsStrategy( 50 ),

            new IncrementAttackMultiplierStrategy( 2, -99 ),
            new MinMaxAttackMultiplierStrategy( 0, 8 ),

            new UpdatePositionStrategy(),
            new KnockBackPlayStrategy(),
        ]);

        var game = new GameController( this._remoteMediator, endTurnStrategy, attackRangeStrategy );
        return game;
    }


    this.showLogin = function() {
        localStorage.removeItem('auth0.idToken' );
        localStorage.removeItem('auth0.userId' );
        auth0.login({
            icon : '/images/shortcut-icon.png',
            connections: [ 'facebook', 'auth0' ]
        });
    }
    
    this.remote = null;
    this.gameMap = {};        

    this._remoteMediator = new RemoteMediator( this.getGameForId.bind( this ));

    this._gameListController = new GameListController( new GameListView() );
    _gameListController.on( 'GAME_SELECTED', this.loadGame.bind( this ));
}

var mc = new MainController();

window.onload = function() {
	var idToken = localStorage.getItem( 'auth0.idToken' );
	var userId  = localStorage.getItem( 'auth0.userId' );
	var windowHash = window.location.hash;

	if ( windowHash === '#logout' ) {
		mc.showLogin();
	} else if ( idToken != null && userId != null ) {
		mc.login( idToken, userId );
//        createGame( remote );
        glc.getGames();
	} else { // no token ; need to log in
		var hash = auth0.parseHash( windowHash );
		if ( hash ) { // callback from authentication
			if ( hash.error ) {
				console.log("There was an error logging in", hash.error);
				alert('There was an error: ' + hash.error + '\n' + hash.error_description);
				return;
			} else {
				localStorage.setItem( 'auth0.idToken', hash.id_token );
				localStorage.setItem( 'auth0.userId',  hash.profile.sub );
                window.location.replace("#");
                window.onload();
			}
		} else { 
			mc.showLogin();
		}
	}
}

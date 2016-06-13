'use strict';

var auth0 = new Auth0({
    domain:       ENV.auth0.domain,
    clientID:     ENV.auth0.accountClientId,
    callbackOnLocationHash: true
});

var mc;

function MainController() {

    this.showLogin = function() {
        localStorage.removeItem('auth0.idToken' );
        localStorage.removeItem('auth0.userId' );
        auth0.login({
            icon : '/images/shortcut-icon.png',
            connections: [ 'facebook', 'auth0' ]
        });
    }

    this.doLogin = function( idToken, userId ) {
        var socket = io( ENV.webSocketUrl );
        this.remote = new RemoteProxy( idToken, userId, socket, ENV.restBaseUrl );
        
        
        // 10 seconds before Token expires
        var jwt = jwt_decode( idToken );
        var timeout = jwt.exp*1000 - Date.now() - 10/*seconds*/ * 1000;

        setTimeout( this.showLogin.bind(this), timeout );

        this.glc.setRemote( this.remote );
        this.glc.getGames();
    }

    this._getGame = function() {
        var attackRangeStrategy = new CompositeAttackRangeStrategy( [
            { from:  1, to: 99, strategy: new OverlappingAttackRangeStrategy() },
            { from:  6, to:  7, strategy: new RadiusAttackRangeStrategy(1) },
            { from:  8, to:  9, strategy: new RadiusAttackRangeStrategy(2) },
            { from: 10, to: 99, strategy: new RadiusAttackRangeStrategy(3) },
        ]);

        var Strategy  = new CompositeStrategy( [
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

        return new GameController( this.remote, Strategy, attackRangeStrategy );
    }
    
    this._gameSelected = function( gameId ) {
        this.glc.setVisibility( false );
        this.gameView.setVisibility( true );

        this.gc = this._getGame();
        this.gc.loadGame( gameId );
    }
    
    this._newGame = function() {
        this.glc.setVisibility( false );
        this.gameView.setVisibility( true );
        this.gc = this._getGame();
        this.gc.createNewGame();
    }
    
    this._backToList = function() {
        this.glc.setVisibility( true );
        this.gameView.setVisibility( false );
    }
    
    this.glc = new GameListController( new GameListView());
    this.glc.on( 'NEW_GAME', this._newGame.bind(this) );
    this.glc.on( 'GAME_SELECTED', this._gameSelected.bind(this) );

    this.gc = null;

    this.gameView = new GameView();

    this._bbv = new BackButtonView();
    this._bbv.on( 'CLICK', this._backToList.bind( this ));

    this.glc.setVisibility( true );
    this.gameView.setVisibility( false );
    
}

window.onload = function() {
	mc = new MainController();

	var idToken = localStorage.getItem( 'auth0.idToken' );
	var userId  = localStorage.getItem( 'auth0.userId' );
	var windowHash = window.location.hash;

	if ( windowHash === '#logout' ) {
		mc.showLogin();
	} else if ( idToken != null && userId != null ) {
        mc.doLogin( idToken, userId );
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

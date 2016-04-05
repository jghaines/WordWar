'use strict';

var gc = {};
var lock;

function createGame( idToken, webSocketUrl, restBaseUrl ) {
	var socket = io( webSocketUrl );
	var remote = new RemoteProxy( idToken, socket, restBaseUrl );

	var attackRangeStrategy = new CompositeAttackRangeStrategy( [
		{ from:  1, to: 99, strategy: new OverlappingAttackRangeStrategy() },
		{ from:  6, to:  7, strategy: new RadiusAttackRangeStrategy(1) },
		{ from:  8, to:  9, strategy: new RadiusAttackRangeStrategy(2) },
		{ from: 10, to: 99, strategy: new RadiusAttackRangeStrategy(3) },
	]);

	var scoreStrategy  = new CompositeScoreStrategy( [
        new TurnPointsEqualsWordPointsScoreStrategy(),
        new WordLengthBonusScoreStrategy( [
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
        new ApplyAttackMulitiplierScoreStrategy(),
        
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
        new SetEndTurnScoreStrategy(),
        new MinMaxEndTurnScoreStrategy( -99999, 500 ),
        new LowWaterMarkLoserScoreStrategy( 0 ),

        new IncrementAttackMultiplierScoreStrategy( 2, -99 ),
        new MinMaxAttackMultiplierScoreStrategy( 0, 8 ),

        new UpdatePositionScoreStrategy(),
        new KnockBackPlayScoreStrategy(),
	]);

	gc = new GameController( remote, scoreStrategy, attackRangeStrategy );
}


function showLogin() {
	localStorage.removeItem('idToken');
	var lock = new Auth0Lock( ENV.auth0.clientID, ENV.auth0.domain );
	lock.show({ authParams: { scope: 'openid' } });
}

window.onload = function() {
	var idToken = localStorage.getItem('idToken');
	var windowHash = window.location.hash;

	if ( windowHash === '#logout' ) {
		showLogin();
	} else if ( idToken ) {
		createGame( idToken, ENV.webSocketUrl, ENV.restBaseUrl )
	} else { // no token ; need to log in
		var lock = new Auth0Lock( ENV.auth0.clientID, ENV.auth0.domain );
		var hash = lock.parseHash( windowHash );
		if ( hash ) { // callback from authentication
			if ( hash.error ) {
				console.log("There was an error logging in", hash.error);
				alert('There was an error: ' + hash.error + '\n' + hash.error_description);
				return;
			} else {
				idToken = hash.id_token;
				localStorage.setItem( 'idToken', idToken );
                window.location.replace("#");
                window.onload();
			}
		} else { 
			showLogin();
		}
	}
}

'use strict';

var gc = {};

window.onload = function(){
	var socket = io();
	var restUrl = "https://fqjtrlps5h.execute-api.us-west-2.amazonaws.com/prod/ExecutePlay";
	var remote = new RemoteProxy( socket, restUrl );

	var attackRangeStrategy = new CompositeAttackRangeStrategy( [
		{ from:  1, to: 99, strategy: new OverlappingAttackRangeStrategy() },
		{ from:  6, to:  7, strategy: new RadiusAttackRangeStrategy(1) },
		{ from:  8, to:  9, strategy: new RadiusAttackRangeStrategy(2) },
		{ from: 10, to: 99, strategy: new RadiusAttackRangeStrategy(3) },
	]);

	var scoreStrategy  = new CompositeScoreStrategy( [
				new ScoreEqualsWordValueScoreStrategy(),
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
				new WinnerPenalisesLoserScoreStrategy(),
				new IncrementAttackMultiplierScoreStrategy( 1, -99 ),
				new MinMaxAttackMultiplierScoreStrategy( 0, 5 ),
				new KnockBackPlayScoreStrategy(),
	]);

	gc = new GameController( remote, scoreStrategy, attackRangeStrategy );
}


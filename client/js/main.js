'use strict';

var gc = {};

window.onload = function(){
	var socket = io();
	var remote = new RemoteProxy( socket );
	//var scoreStrategy = new AttackBeatsMoveScoreStrategy( 2 );
	var scoreStrategy  = new CompositeScoreStrategy( [
				new ScoreEqualsWordValueScoreStrategy(),
				new WordLengthBonusScoreStrategy( [
					{ from:  6, to:  7, bonus: 10 },
					{ from:  8, to:  9, bonus: 20 },
					{ from: 10, to: 99, bonus: 30 },
				]),
				new AttackPenalisesMoveScoreStrategy(),
				new IncrementAttackMultiplierScoreStrategy( 2, -99 ),
				new MinMaxAttackMultiplierScoreStrategy( 0, 10 ),
	]);
	var attackRangeStrategy = new CompositeAttackRangeStrategy( [
		{ from:  1, to: 99, strategy: new OverlappingAttackRangeStrategy() },
		{ from:  6, to:  7, strategy: new RadiusAttackRangeStrategy(1) },
		{ from:  8, to:  9, strategy: new RadiusAttackRangeStrategy(2) },
		{ from: 10, to: 99, strategy: new RadiusAttackRangeStrategy(3) },
	]);

	gc = new GameController( remote, scoreStrategy, attackRangeStrategy );
}

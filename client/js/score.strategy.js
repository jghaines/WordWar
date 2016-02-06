'use strict';

function ScoreEqualsWordValueScoreStrategy() {
	this.calculateScore = function( plays ) {
 		plays.forEach( function( play ) {
			play.score = play.wordValue;
		});
	}
}

function WordLengthBonusScoreStrategy( bonuses ) {
	this._bonusForWordLength = function( wordLength ) {
		for ( var i = this._bonuses.length - 1; i >= 0; --i ) {
			if ( this._bonuses[i].from <= wordLength && wordLength <= this._bonuses[i].to ) {
				return this._bonuses[i].bonus;
			}
		}
		return 0;
	}

	this.calculateScore = function( plays ) {
		plays.forEach( (function( play ) {
			play.score += this._bonusForWordLength( play.word.length );
		}).bind( this ));
	}

	this._bonuses = bonuses;
}

function AttackBeatsMoveScoreStrategy(  ) {
	this.calculateScore = function( plays ) {

		if ( 'attack' == plays[0].moveType && 'move' == plays[1].moveType ||
			 'attack' == plays[0].moveType && 'attack' == plays[1].moveType && plays[0].score > plays[1].score ) {
			// player 0 win
			plays[1].score = -1 * plays[0].attackMultiplier * plays[0].score;
			plays[0].score = 0;

		} else if ( 'move' == plays[0].moveType && 'attack' == plays[1].moveType ||
					'attack' == plays[0].moveType && 'attack' == plays[1].moveType && plays[0].score < plays[1].score ) {
			// player 1 win
			plays[0].score = -1 * plays[1].attackMultiplier * plays[1].score;
			plays[1].score = 0;

		} else if ( 'move' == plays[0].moveType && 'move' == plays[1].moveType ) {
			// scores unchanged

		} else if ( 'attack' == plays[0].moveType && 'attack' == plays[1].moveType && plays[0].score == plays[1].score ) {
			// attack with draw
			plays[0].score = 0;
			plays[1].score = 0;

		} else { // draw: either move-move or equal score attacks
			throw new Error( this.constructor.name + '.calculateScore() - unhandled case' )	;
		}
	}
}

function AttackPenalisesMoveScoreStrategy() {
	this.calculateScore = function( plays ) {
		if ( 'move' == plays[0].moveType && 'move' == plays[1].moveType ) { // move vs. move
			// score unchanged

		} else if ( 'attack' == plays[0].moveType && 'move' == plays[1].moveType ) {
			plays[1].score = plays[1].score - ( plays[0].attackMultiplier * plays[0].score );
			plays[0].score = 0;

		} else if ( 'move' == plays[0].moveType && 'attack' == plays[1].moveType ) {
			plays[0].score = plays[0].score - ( plays[1].attackMultiplier * plays[1].score );
			plays[1].score = 0;

		} else if ( 'attack' == plays[0].moveType && 'attack' == plays[1].moveType ) {
			var highestScore = Math.max( plays[0].score, plays[1].score );
			if ( plays[0].score == plays[1].score ) {
				plays[0].score = 0;
				plays[1].score = 0;
			} else if ( plays[0].score < plays[1].score ) {
				plays[0].score = -1 * plays[1].attackMultiplier * plays[1].score;
				plays[1].score = 0;
			} else if ( plays[0].score > plays[1].score ) {
				plays[1].score = -1 * plays[0].attackMultiplier * plays[0].score;
				plays[0].score = 0;
			}
		}
	}
}

function WinnerPenalisesLoserScoreStrategy() {
 	this.calculateScore = function( plays ) {
		if ( 'attack' == plays[0].moveType && 'move' == plays[1].moveType ||
			 'attack' == plays[0].moveType && 'attack' == plays[1].moveType && plays[0].score > plays[1].score ) {
			// player 0 win
			plays[1].score = plays[1].score - ( plays[0].attackMultiplier * plays[0].score );
			plays[0].score = 0;

		} else if ( 'move' == plays[0].moveType && 'attack' == plays[1].moveType ||
					'attack' == plays[0].moveType && 'attack' == plays[1].moveType && plays[0].score < plays[1].score ) {
			// player 1 win
			plays[0].score = plays[0].score - ( plays[1].attackMultiplier * plays[1].score );
			plays[1].score = 0;

		} else if ( 'move' == plays[0].moveType && 'move' == plays[1].moveType ) {
			// scores unchanged

		} else if ( 'attack' == plays[0].moveType && 'attack' == plays[1].moveType && plays[0].score == plays[1].score ) {
			// attack with draw
			plays[0].score = 0;
			plays[1].score = 0;

		} else { // draw: either move-move or equal score attacks
			throw new Error( this.constructor.name + '.calculateScore() - unhandled case' )	;
		}

 	}
}

// each play will use the same attackMultiplier
function StaticAttackMultiplierScoreStrategy( attackMultiplier ) {
	this.calculateScore = function( plays ) {
 		plays.forEach( (function( play ) {
			play.attackMultiplier = this._attackMultiplier;
		}).bind(this) );
	}

	this._attackMultiplier = attackMultiplier;
}

// updates the attackMultiplier based on moveType and increment settings
function IncrementAttackMultiplierScoreStrategy( incrementAfterMove, incrementAfterAttack ) {
	this.calculateScore = function( plays ) {
		plays.forEach( (function( play ) {
			if ( 'attack' == play.moveType) {
				play.attackMultiplier += this._incrementAfterAttack;
			} else if ( 'move' == play.moveType ) {
				play.attackMultiplier += this._incrementAfterMove;
			}
		}).bind( this ));
	}

	this._incrementAfterMove = incrementAfterMove;
	this._incrementAfterAttack = incrementAfterAttack;
}

// enforce given min- and max-Value
function MinMaxAttackMultiplierScoreStrategy( minValue, maxValue ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.calculateScore = function( plays ) {
		plays.forEach( (function( play ) {
			if ( play.attackMultiplier > this._maxValue ) {
				play.attackMultiplier = this._maxValue;
			} else if ( play.attackMultiplier < this._minValue ) {
				play.attackMultiplier = this._minValue;
			}
		}).bind( this ));
	}

	this._minValue = minValue;
	this._maxValue = maxValue;
}

function CompositeScoreStrategy( scoreStrategyList ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.calculateScore = function( plays ) {
		this._scoreStrategyList.forEach( (function( scoreStrategy ) {
	 		this.log.debug( this.constructor.name, '.calculateScore (', plays, ') - strategy:', scoreStrategy.constructor.name );
			scoreStrategy.calculateScore( plays );
		}).bind( this ) );
 	}
 
 	this._scoreStrategyList = scoreStrategyList;
 }

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

function AttackBeatsMoveScoreStrategy( attack_multiplier ) {
	this._attack_multiplier = 2;

	this.calculateScore = function( plays ) {

 		if ( 'attack' == plays[0].moveType && 'move' == plays[1].moveType ||
 			 'attack' == plays[0].moveType && 'attack' == plays[1].moveType && plays[0].score > plays[1].score ) {
 			// player 0 win
 			plays[1].score = -1 * this._attack_multiplier * plays[0].score;
 			plays[0].score = 0;

 		} else if ( 'move' == plays[0].moveType && 'attack' == plays[1].moveType ||
 					'attack' == plays[0].moveType && 'attack' == plays[1].moveType && plays[0].score < plays[1].score ) {
 			// player 1 win
 			plays[0].score = -1 * this._attack_multiplier * plays[1].score;
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

 	this._attack_multiplier = attack_multiplier;
}

function AttackPenalisesMoveScoreStrategy( attack_multiplier ) {
 	this.calculateScore = function( plays ) {
 		if ( 'move' == plays[0].moveType && 'move' == plays[1].moveType ) { // move vs. move
 			// score unchanged

 		} else if ( 'attack' == plays[0].moveType && 'move' == plays[1].moveType ) {
 			plays[1].score = plays[1].score - ( this._attack_multiplier * plays[0].score );
 			plays[0].score = 0;

 		} else if ( 'move' == plays[0].moveType && 'attack' == plays[1].moveType ) {
 			plays[0].score = plays[0].score - ( this._attack_multiplier * plays[1].score );
 			plays[1].score = 0;

 		} else if ( 'attack' == plays[0].moveType && 'attack' == plays[1].moveType ) {
 			var highestScore = Math.max( plays[0].score, plays[1].score );
 			if ( plays[0].score == plays[1].score ) {
				plays[0].score = 0;
				plays[1].score = 0;
 			} else if ( plays[0].score < plays[1].score ) {
				plays[0].score = -1 * this._attack_multiplier * plays[1].score;
				plays[1].score = 0;
 			} else if ( plays[0].score > plays[1].score ) {
				plays[1].score = -1 * this._attack_multiplier * plays[0].score;
				plays[0].score = 0;
 			}
 		}
 	}

	this._attack_multiplier = attack_multiplier;
}

function CompositeScoreStrategy( scoreStrategyList ) {
	this.calculateScore = function( plays ) {
		this._scoreStrategyList.forEach( function( scoreStrategy ) {
			scoreStrategy.calculateScore( plays );
		});
 	}
 
 	this._scoreStrategyList = scoreStrategyList;
 }

'use strict';

function TurnPointsEqualsWordPointsScoreStrategy() {
	this.calculateScore = function( plays ) {
        plays.forEach( (function( play ) {
            if ( typeof play.wordPoints === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.wordPoints undefined' );
			play.turnPoints = play.wordPoints;
		}).bind( this ));
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
            if ( typeof play.turnPoints === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.turnPoints undefined' );
            if ( typeof play.word === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.word undefined' );

			play.turnPoints += this._bonusForWordLength( play.word.length );
		}).bind( this ));
	}

	this._bonuses = bonuses;
}


function AttackBeatsMoveScoreStrategy(  ) {
	this.calculateScore = function( plays ) {
        if ( plays.length !== 2 ) throw new Error( this.constructor.name + '.calculateScore(plays) expects two players' );
		plays.forEach( (function( play, i ) {
            if ( typeof play.playType === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].playType undefined' );
            if ( typeof play.turnPoints === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].turnPoints undefined' );
            if ( typeof play.attackMultiplier === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].attackMultiplier undefined' );
		}).bind( this ));

		if ( 'attack' == plays[0].playType && 'move' == plays[1].playType ||
			 'attack' == plays[0].playType && 'attack' == plays[1].playType && plays[0].turnPoints > plays[1].turnPoints ) {
			// player 0 win
			plays[1].turnPoints = -1 * plays[0].attackMultiplier * plays[0].turnPoints;
			plays[0].turnPoints = 0;

		} else if ( 'move' == plays[0].playType && 'attack' == plays[1].playType ||
					'attack' == plays[0].playType && 'attack' == plays[1].playType && plays[0].turnPoints < plays[1].turnPoints ) {
			// player 1 win
			plays[0].turnPoints = -1 * plays[1].attackMultiplier * plays[1].turnPoints;
			plays[1].turnPoints = 0;

		} else if ( 'move' == plays[0].playType && 'move' == plays[1].playType ) {
			// scores unchanged

		} else if ( 'attack' == plays[0].playType && 'attack' == plays[1].playType && plays[0].turnPoints == plays[1].turnPoints ) {
			// attack with draw
			plays[0].turnPoints = 0;
			plays[1].turnPoints = 0;

		} else { // draw: either move-move or equal score attacks
			throw new Error( this.constructor.name + '.calculateScore() - unhandled case' )	;
		}
	}
}


function AttackPenalisesMoveScoreStrategy() {
	this.calculateScore = function( plays ) {
        if ( plays.length !== 2 ) throw new Error( this.constructor.name + '.calculateScore(plays) expects two players' );
		plays.forEach( (function( play, i ) {
            if ( typeof play.playType === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].playType undefined' );
            if ( typeof play.turnPoints === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].turnPoints undefined' );
            if ( typeof play.attackMultiplier === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].attackMultiplier undefined' );
		}).bind( this ));

		if ( 'move' == plays[0].playType && 'move' == plays[1].playType ) { // move vs. move
			// score unchanged

		} else if ( 'attack' == plays[0].playType && 'move' == plays[1].playType ) {
			plays[1].turnPoints = plays[1].turnPoints - ( plays[0].attackMultiplier * plays[0].turnPoints );
			plays[0].turnPoints = 0;

		} else if ( 'move' == plays[0].playType && 'attack' == plays[1].playType ) {
			plays[0].turnPoints = plays[0].turnPoints - ( plays[1].attackMultiplier * plays[1].turnPoints );
			plays[1].turnPoints = 0;

		} else if ( 'attack' == plays[0].playType && 'attack' == plays[1].playType ) {
			var highestScore = Math.max( plays[0].turnPoints, plays[1].turnPoints );
			if ( plays[0].turnPoints == plays[1].turnPoints ) {
				plays[0].turnPoints = 0;
				plays[1].turnPoints = 0;
			} else if ( plays[0].turnPoints < plays[1].turnPoints ) {
				plays[0].turnPoints = -1 * plays[1].attackMultiplier * plays[1].turnPoints;
				plays[1].turnPoints = 0;
			} else if ( plays[0].turnPoints > plays[1].turnPoints ) {
				plays[1].turnPoints = -1 * plays[0].attackMultiplier * plays[0].turnPoints;
				plays[0].turnPoints = 0;
			}
		}
	}
}


function WinnerBeatsLoserScoreStrategy() {
 	this.calculateScore = function( plays ) {
        if ( plays.length !== 2 ) throw new Error( this.constructor.name + '.calculateScore(plays) expects two players' );
		plays.forEach( (function( play, i ) {
            if ( typeof play.playType === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].playType undefined' );
            if ( typeof play.turnPoints === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].turnPoints undefined' );
            if ( typeof play.attackMultiplier === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].attackMultiplier undefined' );
		}).bind( this ));

		if ( 'attack' == plays[0].playType && 'move' == plays[1].playType ||
			 'attack' == plays[0].playType && 'attack' == plays[1].playType && plays[0].turnPoints > plays[1].turnPoints ) {
			// player 0 win
			plays[1].turnPoints = plays[1].turnPoints - ( plays[0].attackMultiplier * plays[0].turnPoints );
			plays[0].turnPoints = 0;

		} else if ( 'move' == plays[0].playType && 'attack' == plays[1].playType ||
					'attack' == plays[0].playType && 'attack' == plays[1].playType && plays[0].turnPoints < plays[1].turnPoints ) {
			// player 1 win
			plays[0].turnPoints = plays[0].turnPoints - ( plays[1].attackMultiplier * plays[1].turnPoints );
			plays[1].turnPoints = 0;

		} else if ( 'move' == plays[0].playType && 'move' == plays[1].playType ) {
			// scores unchanged

		} else if ( 'attack' == plays[0].playType && 'attack' == plays[1].playType && plays[0].turnPoints == plays[1].turnPoints ) {
			// attack with draw
			plays[0].turnPoints = 0;
			plays[1].turnPoints = 0;

		} else { // draw: either move-move or equal score attacks
			throw new Error( this.constructor.name + '.calculateScore() - unhandled case' )	;
		}

 	}
}


function WinnerPenalisesLoserScoreStrategy() {
	this.calculateScore = function( plays ) {
        if ( plays.length !== 2 ) throw new Error( this.constructor.name + '.calculateScore(plays) expects two players' );
		plays.forEach( (function( play, i ) {
            if ( typeof play.playType === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].playType undefined' );
            if ( typeof play.turnPoints === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].turnPoints undefined' );
            if ( typeof play.attackMultiplier === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].attackMultiplier undefined' );
		}).bind( this ));

		if ( 'move' == plays[0].playType && 'move' == plays[1].playType ) { // move vs. move
			// score unchanged

		} else if ( 'attack' == plays[0].playType && 'move' == plays[1].playType ) {
			plays[1].turnPoints = plays[1].turnPoints - ( plays[0].attackMultiplier * plays[0].turnPoints );
			plays[0].turnPoints = 0;

		} else if ( 'move' == plays[0].playType && 'attack' == plays[1].playType ) {
			plays[0].turnPoints = plays[0].turnPoints - ( plays[1].attackMultiplier * plays[1].turnPoints );
			plays[1].turnPoints = 0;

		} else if ( 'attack' == plays[0].playType && 'attack' == plays[1].playType ) {
			var highestScore = Math.max( plays[0].turnPoints, plays[1].turnPoints );
			if ( plays[0].turnPoints == plays[1].turnPoints ) {
				plays[0].turnPoints = 0;
				plays[1].turnPoints = 0;
			} else if ( plays[0].turnPoints < plays[1].turnPoints ) {
				plays[0].turnPoints = ( plays[0].attackMultiplier * plays[0].turnPoints ) - ( plays[1].attackMultiplier * plays[1].turnPoints );
				plays[1].turnPoints = 0;
			} else if ( plays[0].turnPoints > plays[1].turnPoints ) {
				plays[1].turnPoints = ( plays[1].attackMultiplier * plays[1].turnPoints ) - ( plays[0].attackMultiplier * plays[0].turnPoints );
				plays[0].turnPoints = 0;
			}
		}
	}
}


// each play will use the same attackMultiplier
function StaticAttackMultiplierScoreStrategy( attackMultiplier ) {
	this.calculateScore = function( plays ) {
 		plays.forEach( (function( play, i ) {
            if ( typeof play.attackMultiplier === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].attackMultiplier undefined' );

			play.attackMultiplier = this._attackMultiplier;
		}).bind(this) );
	}

	this._attackMultiplier = attackMultiplier;
}


// updates the attackMultiplier based on playType and increment settings
function IncrementAttackMultiplierScoreStrategy( incrementAfterMove, incrementAfterAttack ) {
	this.calculateScore = function( plays ) {
		plays.forEach( (function( play ) {
            if ( typeof play.playType === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.playType undefined' );
            if ( typeof play.attackMultiplier === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.playType undefined' );

			if ( 'attack' === play.playType) {
				play.attackMultiplier += this._incrementAfterAttack;
			} else if ( 'move' === play.playType ) {
				play.attackMultiplier += this._incrementAfterMove;
			}
		}).bind( this ));
	}

    if ( typeof incrementAfterMove !== 'number' ) throw new Error( this.constructor.name + '.() expected numeric incrementAfterMove parameter' );
    if ( typeof incrementAfterAttack !== 'number' ) throw new Error( this.constructor.name + '.() expected numeric incrementAfterAttack parameter' );

	this._incrementAfterMove = incrementAfterMove;
	this._incrementAfterAttack = incrementAfterAttack;
}


// enforce given min- and max-Value
function MinMaxAttackMultiplierScoreStrategy( minValue, maxValue ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.calculateScore = function( plays ) {
		plays.forEach( (function( play ) {
            if ( typeof play.attackMultiplier === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.playType undefined' );

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


function KnockBackPlayScoreStrategy() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this._arePlayersOnSameCell = function( plays ) {
 		return ( plays[0].newPosition.equals( plays[1].newPosition ));
	}

	this._knockBackPlayer = function( play ) {
		this.log.info( this.constructor.name + '.knockBackPlayer(.)' );

		if ( play.playRange.min.row == play.playRange.max.row ) { // horizontal move
			if ( play.newPosition.col < play.playRange.max.col ) {
				play.newPosition = play.newPosition.getIncrement( 0, 1 );
			} else if ( play.playRange.min.col < play.newPosition.col ) {
				play.newPosition = play.newPosition.getIncrement( 0, -1 );
			} else {
				throw new Error ( this.constructor.name + '.retreatPlayer() uhnhandled horizontal retreat');
			}

		} else if ( play.playRange.min.col == play.playRange.max.col ) { // vertical move
			if ( play.newPosition.row < play.playRange.max.row ) {
				play.newPosition = play.newPosition.getIncrement( 1, 0 );
			} else if ( play.playRange.min.row < play.newPosition.row ) {
				play.newPosition = play.newPosition.getIncrement( -1, 0 );
			} else {
				throw new Error ( this.constructor.name + '.retreatPlayer() uhnhandled vertical retreat');
			}

		} else {
			throw new Error ( this.constructor.name + '.retreatPlayer() uhnhandled directional retreat');			
		}
	}

	this.calculateScore = function( plays ) {
        if ( plays.length !== 2 ) throw new Error( this.constructor.name + '.calculateScore(plays) expects two players' );
		plays.forEach( (function( play ) {
            if ( typeof play.playType === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.playType undefined' );
            if ( typeof play.playRange === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.playRange undefined' );
            if ( typeof play.newPosition === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.newPosition undefined' );
        }).bind( this ));
        
		// if players have landed on same cell, retreat both players
		if ( this._arePlayersOnSameCell( plays ) ) {
			switch ( plays[0].cmp( plays[1] )) {
				case -1 : 	this._knockBackPlayer( plays[0] );
							break;
				case 0 : 	this._knockBackPlayer( plays[0] );
							this._knockBackPlayer( plays[1] );
							break;
				case 1 : 	this._knockBackPlayer( plays[1] );
							break;
			}
		}
	}
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

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


// apply each ConditionalMetaStrategy rule
//  if all the 'ifTrue' evaluate to true then execute every 'thenDo' strateg(ies)
// @if 
// @then   
// new IfThenStrategy( 
//    { ifTrue : [ new PlayTypeCombinationConditionalStrategy( [ 'attack', 'move' ] ) ], thenDo : [ new OtherStrategy(), ... ] }, ...
// )
function IfThenStrategy( parameters ) {
	this.calculateScore = function( plays ) {
        if ( this._ifTrue.calculateScore( plays )) {
            return this._thenDo.calculateScore( plays );
        }
    }

    if ( typeof parameters.ifTrue === 'undefined' ) throw new Error( this.constructor.name + '() expected ifTrue parameter' );
    if ( typeof parameters.thenDo === 'undefined' ) throw new Error( this.constructor.name + '() expected thenDo parameter' );
    
    this._ifTrue = ( Array.isArray( parameters.ifTrue ) ? new CompositeScoreStrategy( parameters.ifTrue ) : parameters.ifTrue );
    this._thenDo = ( Array.isArray( parameters.thenDo ) ? new CompositeScoreStrategy( parameters.thenDo ) : parameters.thenDo );
}

// calculateScore(plays) returns whether the plays match the given specified playType combination 
// new PlayCombination( [ 'attack', 'move' ] )
function PlayTypeCombinationConditionalStrategy( playTypeList ) {
	this.calculateScore = function( plays ) {
        if ( plays.length !== 2 ) throw new Error( this.constructor.name + '.calculateScore() expected an array length 2 for plays' );
        return ( 
            plays[0].playType + '.' + plays[1].playType === this._playCombination ||
            plays[1].playType + '.' + plays[0].playType === this._playCombination );
    }

    if ( ! Array.isArray( playTypeList )) throw new Error( this.constructor.name + '() expected an array for playTypeList' );
    if ( playTypeList.length !== 2 ) throw new Error( this.constructor.name + '() expected an array length 2 for playTypeList' );
                    
    this._playCombination = playTypeList.join( '.' ); 
}


// Evalute the given functions and set the turnPoints
// The Attacker will be the winner, the Mover will be the loser
// new AttackWinsMetaStrategy( { 
//     winner : _  => { return 0 },
//     loser  : _ => { return _.loser.turnPoints -1 * _.winner.turnPoints }
// })
function AttackWinsMetaStrategy( parameters ) {
    this._getPlaysByOutcome = function( plays ) {
        if ( plays.length !== 2 ) throw new Error( this.constructor.name + '() expected an array length 2 for plays' );

        var playsByOutcome = { _winners : [], _losers : [] };
        if ( plays[0].playType === 'attack' && plays[1].playType === 'move' ) {
            playsByOutcome._winners[0] = playsByOutcome.winner = plays[0];
            playsByOutcome._losers[0]  = playsByOutcome.loser  = plays[1];
        } else if ( plays[0].playType === 'move' && plays[1].playType === 'attack' ) {
            playsByOutcome._losers[0]  = playsByOutcome.loser  = plays[0];
            playsByOutcome._winners[0] = playsByOutcome.winner = plays[1];
        } else {
            throw new Error(this.constructor.name + '.calculateScore() - expected exactly 1 Attack and 1 Move'); 
        }
        return playsByOutcome;
    }

    // TODO - refactor AttackWinsMetaStrategy, HighScoreWinsMetaStrategy to common base class
    this.calculateScore = function( plays ) {
        var playsByOutcome = this._getPlaysByOutcome( plays );
        
        // set .turnPoints after parallel evaluation
        playsByOutcome._winners.forEach( (function(play) {
            play.___tempTurnPoints = this._winnerFunction( playsByOutcome );
        }).bind( this ));
        playsByOutcome._losers.forEach( (function(play) {
            play.___tempTurnPoints = this._loserFunction( playsByOutcome );
        }).bind( this ));
        
        plays.forEach( (function(play) {
            play.turnPoints = play.___tempTurnPoints;
            delete play.___tempTurnPoints;
        }).bind( this ));
    }
    
    if ( typeof parameters.winner !== 'function' )  throw new Error( this.constructor.name + '() expected parameter.winner function' );  
    if ( typeof parameters.loser  !== 'function' )  throw new Error( this.constructor.name + '() expected parameter.loser function' );  
    this._winnerFunction = parameters.winner;
    this._loserFunction = parameters.loser;
}

// Evalute the given functions and set the turnPoints
// The higher score will be the winner.
// Equal score evaluates as a win for both
// new HighScoreWinsMetaStrategy( {
//     winner : _ => { return 0 },
//     loser  : _ => { return -1 * _.winner.turnPoints }
// })
function HighScoreWinsMetaStrategy( parameters ) {
    this._getPlaysByOutcome = function( plays ) {
        if ( plays.length !== 2 ) throw new Error( this.constructor.name + '() expected an array length 2 for plays' );

        var playsByOutcome = { _winners : [], _losers : [] };
        if ( plays[0].turnPoints > plays[1].turnPoints ) {
            playsByOutcome._winners[0] = playsByOutcome.winner = plays[0];
            playsByOutcome._losers[0]  = playsByOutcome.loser  = plays[1];
        } else if ( plays[0].turnPoints < plays[1].turnPoints ) {
            playsByOutcome._losers[0]  = playsByOutcome.loser  = plays[0];
            playsByOutcome._winners[0] = playsByOutcome.winner = plays[1];
        } else if ( plays[0].turnPoints === plays[1].turnPoints ) { // draw - everyone is a winner
            playsByOutcome._winners = plays;
            playsByOutcome._losers  = [];
            playsByOutcome.winner = playsByOutcome.loser = plays[0];
        }
        return playsByOutcome;
    }

    // TODO - refactor AttackWinsMetaStrategy, HighScoreWinsMetaStrategy to common base class
    this.calculateScore = function( plays ) {
        var playsByOutcome = this._getPlaysByOutcome( plays );
        
        // set .turnPoints after parallel evaluation
        playsByOutcome._winners.forEach( (function(play) {
            play.___tempTurnPoints = this._winnerFunction( playsByOutcome );
        }).bind( this ));
        playsByOutcome._losers.forEach( (function(play) {
            play.___tempTurnPoints = this._loserFunction( playsByOutcome );
        }).bind( this ));
        
        plays.forEach( (function(play) {
            play.turnPoints = play.___tempTurnPoints;
            delete play.___tempTurnPoints;
        }).bind( this ));
    }

    if ( typeof parameters.winner !== 'function' )  throw new Error( this.constructor.name + '() expected parameter.winner function' );  
    if ( typeof parameters.loser  !== 'function' )  throw new Error( this.constructor.name + '() expected parameter.loser function' );  
    
    this._winnerFunction = parameters.winner;
    this._loserFunction = parameters.loser;
}

function ApplyAttackMulitiplierScoreStrategy() {
	this.calculateScore = function( plays ) {
		plays.forEach( (function( play ) {
            if ( typeof play.playType === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].playType undefined' );
            if ( typeof play.turnPoints === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].turnPoints undefined' );
            if ( typeof play.attackMultiplier === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play[' + i + '].attackMultiplier undefined' );

            if ( play.playType === 'attack' ) {
			    play.turnPoints *= play.attackMultiplier;
            }
		}).bind( this ));
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


function SetEndTurnScoreStrategy() {
	this.calculateScore = function( plays ) {
 		plays.forEach( (function( play ) {
            if ( typeof play.startTurnScore === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.startTurnScore undefined' );
            if ( typeof play.turnPoints === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.turnPoints undefined' );
            play.endTurnScore = play.startTurnScore + play.turnPoints;
		}).bind( this ) );
	}
}

// enforce minimum maximum total score
function MinMaxEndTurnScoreStrategy( minValue, maxValue ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	this.calculateScore = function( plays ) {
        this.log.info( this.constructor.name + '.calculateScore()' );
		plays.forEach( (function( play ) {
            if ( typeof play.endTurnScore === 'undefined' ) throw new Error( this.constructor.name + '.calculateScore(play) play.endTurnScore undefined' );

			if ( play.endTurnScore > this._maxValue ) {
				play.endTurnScore = this._maxValue;
			} else if ( play.endTurnScore < this._minValue ) {
				play.endTurnScore = this._minValue;
			}
		}).bind( this ));
	}

	this._minValue = minValue;
	this._maxValue = maxValue;
}


// if the endTurnScore drops below the given lowWaterMark, the player has lost
function LowWaterMarkLoserScoreStrategy( lowWaterMark ) {
	this.calculateScore = function( plays ) {
 		plays.forEach( (function( play ) {
            play.lost = (
                typeof play.endTurnScore === 'number' && 
                play.endTurnScore < this._lowWaterMark
            );
		}).bind( this ));
	}
    
    if ( typeof lowWaterMark === 'undefined' ) throw new Error( this.constructor.name + '() expected lowWaterMark parameter' );
    this._lowWaterMark = lowWaterMark;
}


function CompositeScoreStrategy( scoreStrategyList ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.calculateScore = function( plays ) {
        var allTrue = true;
		this._scoreStrategyList.forEach( (function( scoreStrategy ) {
	 		this.log.debug( this.constructor.name, '.calculateScore (', plays, ') - strategy:', scoreStrategy.constructor.name );
			allTrue = scoreStrategy.calculateScore( plays ) && allTrue;
		}).bind( this ) );
        return allTrue;
 	}
 
 	this._scoreStrategyList = scoreStrategyList;
 }

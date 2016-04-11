'use strict';

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

'use strict';

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

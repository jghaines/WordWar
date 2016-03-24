'use strict';

function ScoreView( playEmitter ) {
	this.flashScore = function( playerIndex ) {
		flash( this._scoreUi[playerIndex], 'flash-large-pulse' );
	}

    this._receievePlay = function( play ) {
        this._plays[play.playerIndex] = play;
        
        this._scoreUi[play.playerIndex].text( play.startTurnScore );
        this._scoreUi[play.playerIndex].toggleClass( 'lost', play.lost );
        
        this._attackMultiplierUi[play.playerIndex].text( 'x' + play.startAttackMultiplier );
    }

    playEmitter.on( 'play', this._receievePlay.bind(this) );
    
    this._plays = [];
    this._scoreUi = [
        $( 'span.score.player-0' ),
        $( 'span.score.player-1' ),
    ];

    this._attackMultiplierUi = [
        $( 'span.attackMultiplier.player-0' ),
        $( 'span.attackMultiplier.player-1' ),
    ];
            
}

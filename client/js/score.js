'use strict';

function ScoreView() {
	this.flashScore = function( playerIndex ) {
		flash( this._scoreUi[playerIndex], 'flash-large-pulse' );
	}

    this.setPlay = function( play ) {
        this._plays[play.playerIndex] = play;
        
        this._scoreUi[play.playerIndex].text( play.startTurnScore );
        this._scoreUi[play.playerIndex].toggleClass( 'lost', play.lost );
        
        this._attackMultiplierUi[play.playerIndex].text( 'x' + play.attackMultiplier );
    }

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

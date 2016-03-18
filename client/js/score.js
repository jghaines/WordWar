'use strict';

function ScoreView() {
    this._getUiForPlayerIndex = function( playerIndex ) {
        return $( 'span.score.player-' + playerIndex );
    }

	this.flashScore = function( playerIndex ) {
		flash( this._getUiForPlayerIndex( playerIndex ), 'flash-large-pulse' );
	}

    this.setPlay = function( play ) {
        this._plays[play.playerIndex] = play;
        
        var ui = this._getUiForPlayerIndex( play.playerIndex );

        ui.text( play.startTurnScore );
        ui.toggleClass( 'lost', play.lost );
    }

    this._plays = [];
}

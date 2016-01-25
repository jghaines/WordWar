'use strict';

function AttackBeatsMove() {
	this._ATTACK_MULTIPLIER = 2;

	this.calculateScore = function( playA, playB ) {

 		if ( 'attack' == playA.moveType && 'move' == playB.moveType ||
 			 'attack' == playA.moveType && 'attack' == playB.moveType && playA.wordValue > playB.wordValue ) {
 			// local win
 			playA.score = 0;
 			playB.score = -1 * this._ATTACK_MULTIPLIER * playA.wordValue;

 		} else if ( 'move' == playA.moveType && 'attack' == playB.moveType ||
 					'attack' == playA.moveType && 'attack' == playB.moveType && playA.wordValue < playB.wordValue ) {
 			// remote win
 			playA.score = -1 * this._ATTACK_MULTIPLIER * playB.wordValue;
 			playB.score = 0;

 		} else if ( 'move' == playA.moveType && 'move' == playB.moveType ) {
 			playA.score = playA.wordValue;
 			playB.score = playB.wordValue;

 		} else if ( 'attack' == playA.moveType && 'attack' == playB.moveType && playA.wordValue == playB.wordValue ) {
 			// attack with draw
 			playA.score = 0;
 			playB.score = 0;

 		} else { // draw: either move-move or equal score attacks
 			throw new Error( this.constructor.name + '.calculateScore() - unhandled case' )	;
 		}

		return false;
 	}
 }


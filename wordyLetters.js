'use strict';


module.exports = class LetterGenerator {

	constructor() {
		this._letterDistribution = 
			"A".repeat(9) +
			"B".repeat(2) +
			"C".repeat(2) +
			"D".repeat(4) +
			"E".repeat(12) +
			"F".repeat(2) +
			"G".repeat(3) +
			"H".repeat(2) +
			"I".repeat(9) +
			"J".repeat(1) +
			"K".repeat(1) +
			"L".repeat(4) +
			"M".repeat(2) +
			"N".repeat(6) +
			"O".repeat(8) +
			"P".repeat(2) +
			"Q".repeat(1) +
			"R".repeat(6) +
			"S".repeat(4) +
			"T".repeat(6) +
			"U".repeat(4) +
			"V".repeat(2) +
			"W".repeat(2) +
			"X".repeat(1) +
			"Y".repeat(2) +
			"Z".repeat(1);
	}

	_getLetter() {
		return this._letterDistribution.charAt(Math.floor(Math.random() * this._letterDistribution.length));
	}

	getLetters( letterCount, validityChecker ) {
		var letters;
		do {
			letters = Array.from(Array( letterCount )).map( () => this._getLetter() ).join('');
		} while ( validityChecker !== undefined && ! validityChecker( letters ));
		return letters;
	}
}


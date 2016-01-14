'use strict';

// Distribution from Xander, x2 and rounded
var wordyLetters = 
	"A".repeat(16) +
	"B".repeat(3) +
	"C".repeat(5) +
	"D".repeat(8) +
	"E".repeat(25) +
	"F".repeat(5) +
	"G".repeat(4) +
	"H".repeat(12) +
	"I".repeat(14) +
	"J".repeat(1) +
	"K".repeat(2) +
	"L".repeat(8) +
	"M".repeat(5) +
	"N".repeat(13) +
	"O".repeat(15) +
	"P".repeat(4) +
	"Q".repeat(1) +
	"R".repeat(12) +
	"S".repeat(13) +
	"T".repeat(18) +
	"U".repeat(5) +
	"V".repeat(2) +
	"W".repeat(5) +
	"X".repeat(1) +
	"Y".repeat(4) +
	"Z".repeat(1);



exports.getLetter = function () {
    return wordyLetters.charAt(Math.floor(Math.random() * wordyLetters.length));
}

'use strict';

var _letterDistribution = 
        Array(9).join("A") +
        Array(2).join("B") +
        Array(2).join("C") +
        Array(4).join("D") +
        Array(12).join("E") +
        Array(2).join("F") +
        Array(3).join("G") +
        Array(2).join("H") +
        Array(9).join("I") +
        Array(1).join("J") +
        Array(1).join("K") +
        Array(4).join("L") +
        Array(2).join("M") +
        Array(6).join("N") +
        Array(8).join("O") +
        Array(2).join("P") +
        Array(1).join("Q") +
        Array(6).join("R") +
        Array(2).join("S") +
        Array(6).join("T") +
        Array(4).join("U") +
        Array(2).join("V") +
        Array(2).join("W") +
        Array(1).join("X") +
        Array(2).join("Y") +
        Array(1).join("Z");

var _getLetter = function() {
    return _letterDistribution.charAt(Math.floor(Math.random() * _letterDistribution.length));
}

// return a string of letters
// @letterCount - length of string to return
// @validityChecker - function that checks whether letter string is valid
var getLetters = function( letterCount, validityChecker ) {
    var letters;
    do {
        letters = [];
        for (var i = 0; i < letterCount; i++) {
            letters.push( _getLetter() );
        }
        
    } while ( validityChecker !== undefined && ! validityChecker( letters ));
    return letters.join('');
}

var _vowelCount = function( letters ) {
    var vowels = 'AEIOU';
    var vowelCount = 0;
    letters.forEach( function( letter ) {
        if ( vowels.indexOf( letter ) >= 0 ) {
            ++vowelCount;
        }
    });

    return vowelCount;
}

var vowelCountChecker = function( letters, minVowels, maxVowels ) {
	var vowelCount = _vowelCount( letters );
	return ( vowelCount >= minVowels && vowelCount <= maxVowels );
}



module.exports = {
    vowelCountChecker : vowelCountChecker,
    letterGenerator : getLetters
}
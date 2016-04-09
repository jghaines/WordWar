'use strict';

var _tupleDistribution = [
    [ 'E', 'S' ],
    [ 'I', 'N' ],
    [ 'E', 'R' ],
    [ 'T', 'I' ],
    [ 'T', 'E' ],
    [ 'A', 'T' ],
    [ 'I', 'S' ],
    [ 'O', 'N' ],
    [ 'R', 'E' ],
    [ 'N', 'G' ],
    [ 'E', 'D' ],
    [ 'E', 'N' ],
    [ 'S', 'T' ],
    [ 'R', 'I' ],
    [ 'A', 'L' ],
    [ 'L', 'I' ],
    [ 'A', 'N' ],
    [ 'L', 'E' ],
    [ 'R', 'A' ],
    [ 'N', 'E' ],
    [ 'S', 'E' ],
    [ 'A', 'R' ],
    [ 'I', 'C' ],
    [ 'O', 'R' ],
    [ 'R', 'O' ],
    [ 'N', 'T' ],
    [ 'I', 'T' ],
    [ 'I', 'E' ],
    [ 'L', 'A' ],
    [ 'C', 'O' ],
    [ 'D', 'E' ],
    [ 'S', 'S' ],
    [ 'I', 'O' ],
    [ 'R', 'S' ],
    [ 'N', 'S' ],
    [ 'N', 'I' ],
    [ 'C', 'A' ],
    [ 'A', 'S' ],
    [ 'T', 'A' ],
];

var _letterDistribution = 
        Array(1+9).join("A") +
        Array(1+2).join("B") +
        Array(1+2).join("C") +
        Array(1+4).join("D") +
        Array(1+12).join("E") +
        Array(1+2).join("F") +
        Array(1+3).join("G") +
        Array(1+2).join("H") +
        Array(1+9).join("I") +
        Array(1+1).join("J") +
        Array(1+1).join("K") +
        Array(1+4).join("L") +
        Array(1+2).join("M") +
        Array(1+6).join("N") +
        Array(1+8).join("O") +
        Array(1+2).join("P") +
        Array(1+1).join("Q") +
        Array(1+6).join("R") +
        Array(1+2).join("S") +
        Array(1+6).join("T") +
        Array(1+4).join("U") +
        Array(1+2).join("V") +
        Array(1+2).join("W") +
        Array(1+1).join("X") +
        Array(1+2).join("Y") +
        Array(1+1).join("Z");

var _getLetter = function() {
    return _letterDistribution.charAt(Math.floor(Math.random() * _letterDistribution.length));
}

var _getTuple = function() {
    return _tupleDistribution[ Math.floor(Math.random() * _tupleDistribution.length) ];
}

// return a string of letters
// @letterCount - length of string to return
// @validityChecker - function that checks whether letter string is valid
var getLetters = function( letterCount, tupleCount, validityChecker ) {
    var letters;    
    do {
        letters = [];
        for (var i = tupleCount; i > 0; --i ) {
            letters = letters.concat( _getTuple() );            
        }
        for (var i = letters.length; i < letterCount; i++) {
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
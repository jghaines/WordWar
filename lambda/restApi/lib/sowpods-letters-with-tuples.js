'use strict';

var _letterDistribution = [].concat(
   Array.from( { length :  79 }, () => 'A' ),
   Array.from( { length :  18 }, () => 'B' ),
   Array.from( { length :  41 }, () => 'C' ),
   Array.from( { length :  34 }, () => 'D' ),
   Array.from( { length : 115 }, () => 'E' ),
   Array.from( { length :  12 }, () => 'F' ),
   Array.from( { length :  28 }, () => 'G' ),
   Array.from( { length :  25 }, () => 'H' ),
   Array.from( { length :  92 }, () => 'I' ),
   Array.from( { length :   1 }, () => 'J' ),
   Array.from( { length :   9 }, () => 'K' ),
   Array.from( { length :  53 }, () => 'L' ),
   Array.from( { length :  29 }, () => 'M' ),
   Array.from( { length :  68 }, () => 'N' ),
   Array.from( { length :  67 }, () => 'O' ),
   Array.from( { length :  30 }, () => 'P' ),
   Array.from( { length :   1 }, () => 'Q' ),
   Array.from( { length :  71 }, () => 'R' ),
   Array.from( { length :  98 }, () => 'S' ),
   Array.from( { length :  66 }, () => 'T' ),
   Array.from( { length :  33 }, () => 'U' ),
   Array.from( { length :   9 }, () => 'V' ),
   Array.from( { length :   7 }, () => 'W' ),
   Array.from( { length :   2 }, () => 'X' ),
   Array.from( { length :  16 }, () => 'Y' ),
   Array.from( { length :   4 }, () => 'Z' )
);

var _getLetter = function() {
    return _letterDistribution[ Math.floor(Math.random() * _letterDistribution.length) ];
}


var _tupleDistribution = [ // tuple-parser.js 15 0 // without weighting
   ["E","S"],
   ["I","N"],
   ["E","R"],
   ["T","I"],
   ["T","E"],
   ["A","T"],
   ["I","S"],
   ["O","N"],
   ["R","E"],
   ["N","G"],
   ["E","D"],
   ["E","N"],
   ["S","T"],
   ["R","I"],
   ["A","L"],
];

var _getTuple = function( tupleBagSize ) {
    if ( ! tupleBagSize ||  tupleBagSize > _tupleDistribution.length || tupleBagSize <= 0 ) {
        tupleBagSize = _tupleDistribution.length;
    }
    
    return _tupleDistribution[ Math.floor( Math.random() * tupleBagSize ) ];
}

// return a string of letters
// @letterCount - length of string to return
// @validityChecker - function that checks whether letter string is valid
var getLetters = function( letterCount, tupleCount, validityChecker ) {
    var letters;    
    do {
        letters = [];
        for (var i = tupleCount; i > 0; --i ) {
            letters = letters.concat( _getTuple( null ) );            
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
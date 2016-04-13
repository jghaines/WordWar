'use strict';

var _letterDistribution = [].concat( // distribution-parser.js 1000
   Array.from( { length :  79 }, function() { return 'A' } ),
   Array.from( { length :  18 }, function() { return 'B' } ),
   Array.from( { length :  41 }, function() { return 'C' } ),
   Array.from( { length :  34 }, function() { return 'D' } ),
   Array.from( { length : 115 }, function() { return 'E' } ),
   Array.from( { length :  12 }, function() { return 'F' } ),
   Array.from( { length :  28 }, function() { return 'G' } ),
   Array.from( { length :  25 }, function() { return 'H' } ),
   Array.from( { length :  92 }, function() { return 'I' } ),
   Array.from( { length :   1 }, function() { return 'J' } ),
   Array.from( { length :   9 }, function() { return 'K' } ),
   Array.from( { length :  53 }, function() { return 'L' } ),
   Array.from( { length :  29 }, function() { return 'M' } ),
   Array.from( { length :  68 }, function() { return 'N' } ),
   Array.from( { length :  67 }, function() { return 'O' } ),
   Array.from( { length :  30 }, function() { return 'P' } ),
   Array.from( { length :   1 }, function() { return 'Q' } ),
   Array.from( { length :  71 }, function() { return 'R' } ),
   Array.from( { length :  98 }, function() { return 'S' } ),
   Array.from( { length :  66 }, function() { return 'T' } ),
   Array.from( { length :  33 }, function() { return 'U' } ),
   Array.from( { length :   9 }, function() { return 'V' } ),
   Array.from( { length :   7 }, function() { return 'W' } ),
   Array.from( { length :   2 }, function() { return 'X' } ),
   Array.from( { length :  16 }, function() { return 'Y' } ),
   Array.from( { length :   4 }, function() { return 'Z' } )
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

// var getTileGenerator = function()

module.exports = {
    vowelCountChecker : vowelCountChecker,
    letterGenerator : getLetters
}
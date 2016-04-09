'use strict';

var _letterDistribution = [].concat(
   Array.from( { length : 79 }, () => 'A' ),
   Array.from( { length : 18 }, () => 'B' ),
   Array.from( { length : 41 }, () => 'C' ),
   Array.from( { length : 34 }, () => 'D' ),
   Array.from( { length : 115 }, () => 'E' ),
   Array.from( { length : 12 }, () => 'F' ),
   Array.from( { length : 28 }, () => 'G' ),
   Array.from( { length : 25 }, () => 'H' ),
   Array.from( { length : 92 }, () => 'I' ),
   Array.from( { length : 1 }, () => 'J' ),
   Array.from( { length : 9 }, () => 'K' ),
   Array.from( { length : 53 }, () => 'L' ),
   Array.from( { length : 29 }, () => 'M' ),
   Array.from( { length : 68 }, () => 'N' ),
   Array.from( { length : 67 }, () => 'O' ),
   Array.from( { length : 30 }, () => 'P' ),
   Array.from( { length : 1 }, () => 'Q' ),
   Array.from( { length : 71 }, () => 'R' ),
   Array.from( { length : 98 }, () => 'S' ),
   Array.from( { length : 66 }, () => 'T' ),
   Array.from( { length : 33 }, () => 'U' ),
   Array.from( { length : 9 }, () => 'V' ),
   Array.from( { length : 7 }, () => 'W' ),
   Array.from( { length : 2 }, () => 'X' ),
   Array.from( { length : 16 }, () => 'Y' ),
   Array.from( { length : 4 }, () => 'Z' )
);

var _getLetter = function() {
    return _letterDistribution[ Math.floor(Math.random() * _letterDistribution.length) ];
}


var _tupleDistribution = [].concat ( // tuple-parser.js 160 500 // with weighting
   Array.from( { length : 15 }, () => ["E","S"] ),
   Array.from( { length : 13 }, () => ["I","N"] ),
   Array.from( { length : 13 }, () => ["E","R"] ),
   Array.from( { length : 9 }, () => ["T","I"] ),
   Array.from( { length : 8 }, () => ["T","E"] ),
   Array.from( { length : 7 }, () => ["A","T"] ),
   Array.from( { length : 7 }, () => ["I","S"] ),
   Array.from( { length : 7 }, () => ["O","N"] ),
   Array.from( { length : 7 }, () => ["R","E"] ),
   Array.from( { length : 7 }, () => ["N","G"] ),
   Array.from( { length : 7 }, () => ["E","D"] ),
   Array.from( { length : 6 }, () => ["E","N"] ),
   Array.from( { length : 6 }, () => ["S","T"] ),
   Array.from( { length : 6 }, () => ["R","I"] ),
   Array.from( { length : 6 }, () => ["A","L"] ),
   Array.from( { length : 6 }, () => ["L","I"] ),
   Array.from( { length : 6 }, () => ["A","N"] ),
   Array.from( { length : 6 }, () => ["L","E"] ),
   Array.from( { length : 6 }, () => ["R","A"] ),
   Array.from( { length : 5 }, () => ["N","E"] ),
   Array.from( { length : 5 }, () => ["S","E"] ),
   Array.from( { length : 5 }, () => ["A","R"] ),
   Array.from( { length : 5 }, () => ["I","C"] ),
   Array.from( { length : 5 }, () => ["O","R"] ),
   Array.from( { length : 5 }, () => ["R","O"] ),
   Array.from( { length : 4 }, () => ["N","T"] ),
   Array.from( { length : 4 }, () => ["I","T"] ),
   Array.from( { length : 4 }, () => ["I","E"] ),
   Array.from( { length : 4 }, () => ["L","A"] ),
   Array.from( { length : 4 }, () => ["C","O"] ),
   Array.from( { length : 4 }, () => ["D","E"] ),
   Array.from( { length : 4 }, () => ["S","S"] ),
   Array.from( { length : 4 }, () => ["I","O"] ),
   Array.from( { length : 3 }, () => ["R","S"] ),
   Array.from( { length : 3 }, () => ["N","S"] ),
   Array.from( { length : 3 }, () => ["N","I"] ),
   Array.from( { length : 3 }, () => ["C","A"] ),
   Array.from( { length : 3 }, () => ["A","S"] ),
   Array.from( { length : 3 }, () => ["T","A"] ),
   Array.from( { length : 3 }, () => ["H","E"] ),
   Array.from( { length : 3 }, () => ["D","I"] ),
   Array.from( { length : 3 }, () => ["T","O"] ),
   Array.from( { length : 3 }, () => ["T","R"] ),
   Array.from( { length : 3 }, () => ["M","E"] ),
   Array.from( { length : 3 }, () => ["C","H"] ),
   Array.from( { length : 3 }, () => ["U","N"] ),
   Array.from( { length : 3 }, () => ["L","O"] ),
   Array.from( { length : 3 }, () => ["E","L"] ),
   Array.from( { length : 3 }, () => ["O","L"] ),
   Array.from( { length : 3 }, () => ["L","L"] ),
   Array.from( { length : 3 }, () => ["E","T"] ),
   Array.from( { length : 3 }, () => ["O","U"] ),
   Array.from( { length : 3 }, () => ["M","A"] ),
   Array.from( { length : 3 }, () => ["M","I"] ),
   Array.from( { length : 3 }, () => ["S","I"] ),
   Array.from( { length : 3 }, () => ["P","E"] ),
   Array.from( { length : 3 }, () => ["V","E"] ),
   Array.from( { length : 3 }, () => ["I","L"] ),
   Array.from( { length : 2 }, () => ["A","C"] ),
   Array.from( { length : 2 }, () => ["L","Y"] ),
   Array.from( { length : 2 }, () => ["N","A"] ),
   Array.from( { length : 2 }, () => ["U","S"] ),
   Array.from( { length : 2 }, () => ["E","A"] ),
   Array.from( { length : 2 }, () => ["O","M"] ),
   Array.from( { length : 2 }, () => ["I","A"] ),
   Array.from( { length : 2 }, () => ["H","I"] ),
   Array.from( { length : 2 }, () => ["T","H"] ),
   Array.from( { length : 2 }, () => ["U","R"] ),
   Array.from( { length : 2 }, () => ["H","O"] ),
   Array.from( { length : 2 }, () => ["O","S"] ),
   Array.from( { length : 2 }, () => ["T","S"] ),
   Array.from( { length : 2 }, () => ["N","D"] ),
   Array.from( { length : 2 }, () => ["C","E"] ),
   Array.from( { length : 2 }, () => ["H","A"] ),
   Array.from( { length : 2 }, () => ["S","H"] ),
   Array.from( { length : 2 }, () => ["N","O"] ),
   Array.from( { length : 2 }, () => ["P","H"] ),
   Array.from( { length : 2 }, () => ["E","C"] ),
   Array.from( { length : 2 }, () => ["U","L"] ),
   Array.from( { length : 2 }, () => ["G","E"] ),
   Array.from( { length : 2 }, () => ["N","C"] ),
   Array.from( { length : 2 }, () => ["O","P"] ),
   Array.from( { length : 2 }, () => ["P","R"] ),
   Array.from( { length : 2 }, () => ["P","O"] ),
   Array.from( { length : 2 }, () => ["P","A"] ),
   Array.from( { length : 2 }, () => ["O","T"] ),
   Array.from( { length : 2 }, () => ["M","O"] ),
   Array.from( { length : 2 }, () => ["A","B"] ),
   Array.from( { length : 2 }, () => ["E","M"] ),
   Array.from( { length : 2 }, () => ["C","I"] ),
   Array.from( { length : 2 }, () => ["A","M"] ),
   Array.from( { length : 2 }, () => ["B","L"] ),
   Array.from( { length : 2 }, () => ["O","G"] ),
   Array.from( { length : 2 }, () => ["P","I"] ),
   Array.from( { length : 2 }, () => ["I","D"] ),
   Array.from( { length : 1 }, () => ["U","T"] ),
   Array.from( { length : 1 }, () => ["S","A"] ),
   Array.from( { length : 1 }, () => ["A","P"] ),
   Array.from( { length : 1 }, () => ["S","C"] ),
   Array.from( { length : 1 }, () => ["A","D"] ),
   Array.from( { length : 1 }, () => ["I","Z"] ),
   Array.from( { length : 1 }, () => ["C","T"] ),
   Array.from( { length : 1 }, () => ["B","I"] ),
   Array.from( { length : 1 }, () => ["G","I"] ),
   Array.from( { length : 1 }, () => ["B","A"] ),
   Array.from( { length : 1 }, () => ["O","C"] ),
   Array.from( { length : 1 }, () => ["S","U"] ),
   Array.from( { length : 1 }, () => ["O","O"] ),
   Array.from( { length : 1 }, () => ["B","E"] ),
   Array.from( { length : 1 }, () => ["C","K"] ),
   Array.from( { length : 1 }, () => ["E","E"] ),
   Array.from( { length : 1 }, () => ["K","E"] ),
   Array.from( { length : 1 }, () => ["A","G"] ),
   Array.from( { length : 1 }, () => ["S","P"] ),
   Array.from( { length : 1 }, () => ["S","O"] ),
   Array.from( { length : 1 }, () => ["U","M"] ),
   Array.from( { length : 1 }, () => ["I","M"] ),
   Array.from( { length : 1 }, () => ["C","R"] ),
   Array.from( { length : 1 }, () => ["R","T"] ),
   Array.from( { length : 1 }, () => ["B","O"] ),
   Array.from( { length : 1 }, () => ["G","R"] ),
   Array.from( { length : 1 }, () => ["E","P"] ),
   Array.from( { length : 1 }, () => ["S","M"] ),
   Array.from( { length : 1 }, () => ["I","R"] ),
   Array.from( { length : 1 }, () => ["F","I"] ),
   Array.from( { length : 1 }, () => ["A","I"] ),
   Array.from( { length : 1 }, () => ["G","A"] ),
   Array.from( { length : 1 }, () => ["I","V"] ),
   Array.from( { length : 1 }, () => ["Z","E"] ),
   Array.from( { length : 1 }, () => ["D","O"] ),
   Array.from( { length : 1 }, () => ["P","L"] ),
   Array.from( { length : 1 }, () => ["I","G"] ),
   Array.from( { length : 1 }, () => ["V","I"] ),
   Array.from( { length : 1 }, () => ["M","P"] ),
   Array.from( { length : 1 }, () => ["T","U"] ),
   Array.from( { length : 1 }, () => ["C","U"] ),
   Array.from( { length : 1 }, () => ["T","T"] ),
   Array.from( { length : 1 }, () => ["O","D"] ),
   Array.from( { length : 1 }, () => ["L","U"] ),
   Array.from( { length : 1 }, () => ["D","A"] ),
   Array.from( { length : 1 }, () => ["I","P"] ),
   Array.from( { length : 1 }, () => ["R","U"] ),
   Array.from( { length : 1 }, () => ["G","S"] ),
   Array.from( { length : 1 }, () => ["K","I"] ),
   Array.from( { length : 1 }, () => ["D","S"] ),
   Array.from( { length : 1 }, () => ["L","S"] ),
   Array.from( { length : 1 }, () => ["B","R"] ),
   Array.from( { length : 1 }, () => ["O","V"] ),
   Array.from( { length : 1 }, () => ["R","M"] ),
   Array.from( { length : 1 }, () => ["Q","U"] ),
   Array.from( { length : 1 }, () => ["M","S"] ),
   Array.from( { length : 1 }, () => ["H","Y"] ),
   Array.from( { length : 1 }, () => ["W","A"] ),
   Array.from( { length : 1 }, () => ["R","Y"] ),
   Array.from( { length : 1 }, () => ["R","D"] ),
   Array.from( { length : 1 }, () => ["T","Y"] ),
   Array.from( { length : 1 }, () => ["O","W"] ),
   Array.from( { length : 1 }, () => ["I","F"] ),
   Array.from( { length : 1 }, () => ["R","R"] ),
   Array.from( { length : 1 }, () => ["A","U"] )
);

var _getTuple = function( tupleBagSize ) {
    if ( ! tupleBagSize ||  tupleBagSize > _tupleDistribution.length || tupleBagSize <= 0 ) {
        tupleBagSize = _tupleDistribution.length;
    }
    
    return _tupleDistribution[ Math.floor( Math.random() * tupleBagSize ) ];
}

// return a string of letters
// @letterCount - length of string to return
// @validityChecker - function that checks whether letter string is valid
var getLetters = function( letterCount, tupleCount, tupleBagCount, validityChecker ) {
    var letters;    
    do {
        letters = [];
        for (var i = tupleCount; i > 0; --i ) {
            letters = letters.concat( _getTuple( tupleBagCount ) );            
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
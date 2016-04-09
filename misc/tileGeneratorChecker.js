#!/usr/bin/env node

'use strict';


var Anagram = require('./lib/anagrammer');
var WordyLetters = require('../lambda/restApi/lib/wordy-letters');
var wordyLettersTuples = require('../lambda/restApi/lib/wordy-letters-with-tuples');

var algorithms = {
    wordyLetters : (word) => {
        return WordyLetters.letterGenerator( 10, word => {
            return WordyLetters.vowelCountChecker( word, 2, 8 );
        });
    },
    wordyLettersTuples1 : (word) => {
        return wordyLettersTuples.letterGenerator( 10, 1, word => {
            return wordyLettersTuples.vowelCountChecker( word, 2, 8 );
        });
    },
    wordyLettersTuples2 : (word) => {
        return wordyLettersTuples.letterGenerator( 10, 2, word => {
            return wordyLettersTuples.vowelCountChecker( word, 2, 8 );
        });
    },
    wordyLettersTuples3 : (word) => {
        return wordyLettersTuples.letterGenerator( 10, 3, word => {
            return wordyLettersTuples.vowelCountChecker( word, 2, 8 );
        });
    },
    wordyLettersTuples4 : (word) => {
        return wordyLettersTuples.letterGenerator( 10, 4, word => {
            return wordyLettersTuples.vowelCountChecker( word, 2, 8 );
        });
    },
    wordyLettersTuples5 : (word) => {
        return wordyLettersTuples.letterGenerator( 10, 5, () => { return true; } );
    },
    wordyLettersTuples6 : (word) => {
        return wordyLettersTuples.letterGenerator( 10, 6, () => { return true; } );
    },
/*   wordyLettersNoVowelCheck : (word) => {
        return WordyLetters.letterGenerator( 10, word => {
            return true;
        });
    },*/
}

function runAlgorithms() {
    var anagramResults = {};

    Object.keys( algorithms ).forEach( key => {
        console.log('runAlgorithms - ' + key);

        anagramResults[key] = anagramResults[key] || {};
        anagramResults[key]['distribution'] = {};
        anagramResults[key]['distributionCount'] = 0;
        anagramResults[key]['anagramCount'] = 0;
        anagramResults[key]['anagramMinLength'] = 999999;
        anagramResults[key]['anagramMaxLength'] = -1;

        var wordLengthTotal = 0;
        var tilesLengthTotal = 0;
        for( var i = runCount; i > 0; --i ) {
           var tiles = algorithms[key]();
           var anagrams = Anagram.anagram(tiles);

           anagramResults[key]['anagramCount'] += anagrams.length;
           tilesLengthTotal += tiles.length;

           anagrams.forEach( word => {
                if ( word.length < anagramResults[key]['anagramMinLength'] ) {
                    anagramResults[key]['anagramMinLength'] = word.length;
                }
                if ( word.length > anagramResults[key]['anagramMaxLength'] ) {
                    anagramResults[key]['anagramMaxLength'] = word.length;
                }
                wordLengthTotal += word.length;
           });
           
           tiles.split( '' ).forEach( letter => {
               anagramResults[key]['distribution'][letter] = anagramResults[key]['distribution'][letter] || 0;
               ++anagramResults[key]['distribution'][letter];
           });
        }
        anagramResults[key]['anagramAverageLength'] = wordLengthTotal / anagramResults[key]['anagramCount'];
        anagramResults[key]['tilesAverageLength'] = tilesLengthTotal / runCount;
        anagramResults[key]['distributionCount'] = Object.keys( anagramResults[key]['distribution'] ).length;
    });
    return anagramResults;
}

function outputResults( result ) {
    console.log(JSON.stringify(result, 
        (key, value) => {
            if ( key === 'distribution' ) { // sort the distribution map
                return Object.keys( value ).sort().reduce( (map, key) => {
                    map[key] = value[key];
                    return map;
                }, {} ) 
            } else if ( key === 'anagramCount' ) {
                return value.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,');
            }
            return value;
        },
    2));
}

var filename = process.argv[2] || __dirname + '/sowpods.head.json';
var runCount = process.argv[3] || 1000;


Anagram.loadDictionaryAsync( filename ).then(
    runAlgorithms
).then(
    outputResults
);

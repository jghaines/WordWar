#!/usr/bin/env node 

'use strict';


var Anagram = require('./lib/anagrammer');
var WordyLetters = require('../lambda/restApi/lib/wordy-letters');
var wordyLettersTuples = require('../lambda/restApi/lib/wordy-letters-with-tuples');
var sowpodsLettersTuples = require('../lambda/restApi/lib/sowpods-letters-with-tuples');

var algorithms = {
//     wordyLettersTruncated : (word) => {
//         return WordyLetters.letterGenerator( 10, word => {
//             return WordyLetters.vowelCountChecker( word, 2, 8 );
//         });
//     },
//     wordyLettersTuples1 : (word) => {
//         return wordyLettersTuples.letterGenerator( 10, 1, () => { return true } );
//     },
//     wordyLettersTuples2 : (word) => {
//         return wordyLettersTuples.letterGenerator( 10, 2, () => { return true } );
//     },
//     wordyLettersTuples3 : (word) => {
//         return wordyLettersTuples.letterGenerator( 10, 3, () => { return true } );
//     },
//     wordyLettersTuples4 : (word) => {
//         return wordyLettersTuples.letterGenerator( 10, 4, () => { return true } );
//     },
//     sowpodsLettersTuples0 : (word) => {
//         return sowpodsLettersTuples.letterGenerator( 10, 0, word => {
//             return WordyLetters.vowelCountChecker( word, 2, 8 );
//         });
//     },
//     sowpodsLettersTuples1 : (word) => {
//         return sowpodsLettersTuples.letterGenerator( 10, 1, () => { return true } );
//     },
//     sowpodsLettersTuples2 : (word) => {
//         return sowpodsLettersTuples.letterGenerator( 10, 2, () => { return true } );
//     },
//     sowpodsLettersTuples3 : (word) => {
//         return sowpodsLettersTuples.letterGenerator( 10, 3, () => { return true } );
//     },
//     sowpodsLettersTuples4 : (word) => {
//         return sowpodsLettersTuples.letterGenerator( 10, 4, () => { return true } );
//     },
//     sowpodsLettersTuples5 : (word) => {
//         return sowpodsLettersTuples.letterGenerator( 10, 5, () => { return true } );
//     },
    // sowpodsLettersTuples2Bag1 : (word) => {
    //     return sowpodsLettersTuples.letterGenerator( 10, 2, 1, () => { return true } );
    // },
    // sowpodsLettersTuples2Bag2 : (word) => {
    //     return sowpodsLettersTuples.letterGenerator( 10, 2, 2, () => { return true } );
    // },
    // sowpodsLettersTuples2Bag10 : (word) => {
    //     return sowpodsLettersTuples.letterGenerator( 10, 2, 10, () => { return true } );
    // },
    // sowpodsLettersTuples2Bag20 : (word) => {
    //     return sowpodsLettersTuples.letterGenerator( 10, 2, 20, () => { return true } );
    // },
    // sowpodsLettersTuples2Bag30 : (word) => {
    //     return sowpodsLettersTuples.letterGenerator( 10, 2, 30, () => { return true } );
    // },
    // sowpodsLettersTuples2Bag40 : (word) => {
    //     return sowpodsLettersTuples.letterGenerator( 10, 2, 40, () => { return true } );
    // },
    // sowpodsLettersTuples2Bag50 : (word) => {
    //     return sowpodsLettersTuples.letterGenerator( 10, 2, 50, () => { return true } );
    // },
    // sowpodsLettersTuples2Bag60 : (word) => {
    //     return sowpodsLettersTuples.letterGenerator( 10, 2, 60, () => { return true } );
    // },
    // sowpodsLettersTuples2Bag70 : (word) => {
    //     return sowpodsLettersTuples.letterGenerator( 10, 2, 70, () => { return true } );
    // },
    // sowpodsLettersTuples2Bag12 : (word) => {
    //     return sowpodsLettersTuples.letterGenerator( 10, 2, 12, () => { return true } );
    // },
    // sowpodsLettersTuples2Bag13 : (word) => {
    //     return sowpodsLettersTuples.letterGenerator( 10, 2, 13, () => { return true } );
    // },
    sowpodsLettersTuples1Bag15 : (word) => {
        return sowpodsLettersTuples.letterGenerator( 10, 1, 15, () => { return true } );
    },
    sowpodsLettersTuples2Bag15 : (word) => {
        return sowpodsLettersTuples.letterGenerator( 10, 2, 15, () => { return true } );
    },
    sowpodsLettersTuples2Bag16 : (word) => {
        return sowpodsLettersTuples.letterGenerator( 10, 2, 16, () => { return true } );
    },
    sowpodsLettersTuples2Bag17 : (word) => {
        return sowpodsLettersTuples.letterGenerator( 10, 2, 17, () => { return true } );
    },
    sowpodsLettersTuples2Bag20 : (word) => {
        return sowpodsLettersTuples.letterGenerator( 10, 2, 20, () => { return true } );
    },
    sowpodsLettersTuples3Bag15 : (word) => {
        return sowpodsLettersTuples.letterGenerator( 10, 3, 15, () => { return true } );
    },
    sowpodsLettersTuples3Bag20 : (word) => {
        return sowpodsLettersTuples.letterGenerator( 10, 3, 20, () => { return true } );
    },
    sowpods12LettersTuples2Bag15 : (word) => {
        return sowpodsLettersTuples.letterGenerator( 12, 2, 15, () => { return true } );
    },
    // sowpodsLettersTuples2Bag16 : (word) => {
    //     return sowpodsLettersTuples.letterGenerator( 10, 2, 16, () => { return true } );
    // },
    // sowpodsLettersTuples2Bag17 : (word) => {
    //     return sowpodsLettersTuples.letterGenerator( 10, 2, 17, () => { return true } );
    // },
    // sowpodsLettersTuples2Bag20 : (word) => {
    //     return sowpodsLettersTuples.letterGenerator( 10, 2, 20, () => { return true } );
    // },
    // sowpodsLettersTuples2Bag25 : (word) => {
    //     return sowpodsLettersTuples.letterGenerator( 10, 2, 25, () => { return true } );
    // },
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

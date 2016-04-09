'use strict';

var fs = require('fs');
var Promise = require("bluebird");
var jsonfile = require('jsonfile')

var globalTrie = { 'TERMINAL' : false };

function getKeyForWord( word ) {
    return word.split('').sort().join('');
}

function addToTrie( letterArray, trie ) {
    if ( letterArray.length === 0 ) {
        trie['TERMINAL'] = true;
        return;
    }
    
    var nextLetter = letterArray[0];
    trie[nextLetter] = trie[nextLetter] || { 'TERMINAL' : false }; 
    addToTrie( letterArray.slice( 1 ), trie[nextLetter] );
}

function scanTrie( candidate, letterArray, trie, matches ) {
    if ( trie['TERMINAL'] ) {
        matches[candidate] = true;
    }
    for (var i = 0; i < letterArray.length; i++) {
        var letter = letterArray[i];
        var subTrie = trie[letter];
        if ( subTrie ) {
            var otherLetters = letterArray.slice(0, i).concat( letterArray.slice(i+1) );
            scanTrie( candidate + letter, otherLetters, subTrie, matches );
        }
    }
}

function loadDictionary( filename, callback ) {
    var match;
    match = filename.match( /(.*)\.txt$/ );
    if ( match ) {
        var lineReader = require('readline').createInterface({
            input: require('fs').createReadStream( filename )
        });

        lineReader.on('line', function( word ) {
            addToTrie( word.toLowerCase().split(''), globalTrie );
        });

        lineReader.on('close', function() {
            var jsonFileName = match[1] + '.json';
 
            jsonfile.writeFile(jsonFileName, globalTrie, function (err) {
                console.error(err)
            });
                        
            callback();
        });
        return;
    }
     
    match = filename.match( /(.*)\.json$/ );
    if ( match ) {
        jsonfile.readFile( filename, function(err, obj) {
            if ( err ) {
                throw new Error(err);
            } else {
                globalTrie = obj;
                callback();
            }
        });           
    } else {
        throw new Error( 'Expected .txt or .json file for ' + filename );
    }
}


function anagram( word ) {
    var matches = {};
    scanTrie( '', word.toLowerCase().split(''), globalTrie, matches );
    return Object.keys( matches );
}

module.exports = {
    loadDictionary : loadDictionary,
    loadDictionaryAsync    : Promise.promisify( loadDictionary ),
    anagram : anagram
} 
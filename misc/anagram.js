#!/usr/bin/env node 

'use strict';


var Anagram = require('./lib/anagrammer');

if ( process.argv.length <= 2 ) {
    console.error( "Expected letters to anagram on command line" );
    process.exit( 1 );
}

var anagrams = Anagram.anagram( process.argv.splice( 2 ));
console.log( JSON.stringify( anagrams, null, 2 ));

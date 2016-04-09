#!/usr/bin/env node
// search through sowpods and calculate the letter distribution

'use strict';


var fs = require('fs');

var readable = fs.createReadStream( __dirname + '/sowpods.txt', {
    encoding : 'utf8' // otherwise we get a binary Buffer
});

var distribution = {};

readable.on( 'data', data  => {
    data.split('').forEach( letter => {
        if ( letter.match( /[a-z]/ ) ) {
            distribution[letter] = distribution[letter] || 0;
            ++distribution[letter];
        }
    })
});

readable.on( 'end', () => {
    var totalTileCount = process.argv[2]; 
    var totalLetters = Object.keys( distribution ).reduce( (prev,curr) => { return prev + distribution[curr] }, 0 );

    Object.keys( distribution ).sort().forEach( letter => {
        if ( totalTileCount ) {
            var tileCount = Math.floor( totalTileCount * distribution[letter] / totalLetters ); 
            console.log(`   Array.from( { length : ${ tileCount } }, () => '${ letter.toUpperCase() }' ),`);
        } else {
            console.log(`${ letter } : ${ distribution[letter] }`);
        }
    });
    process.exit();
});

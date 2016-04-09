#!/usr/bin/env node
// search through sowpods and count every (two-letter) tuple
// print them from most to least common

'use strict';


var fs = require('fs');

var readable = fs.createReadStream( __dirname + '/sowpods.txt', {
    encoding : 'utf8' // otherwise we get a binary Buffer
});

var previous = ' ';
var tuple = {};
var array = [];

readable.on( 'data', ( data ) => {
    
    data.split('').forEach( function(current) {
        current = current.toUpperCase();

        if ( previous && previous.match( /[A-Za-z]/ ) &&
             current  && current.match( /[A-Za-z]/ )) {
            tuple[previous] = tuple[previous] || {};
            tuple[previous][current] = tuple[previous][current] || 0; 

            tuple[previous][current]++;
        }
        previous = current;
    })
});

readable.on( 'end', ( data ) => {
    Object.keys(tuple).sort().forEach( function( first ) {
        Object.keys(tuple[first]).sort().forEach( function( second ) {
            array.push( { tuple : first+second, count : tuple[first][second], array : [ first, second ] } );
        });
    });
    
    array.sort( function(a,b) {
       if ( a.count < b.count ) return 1; 
       if ( a.count > b.count ) return -1;
       return 0; 
    });
    
    
    var headCount = process.argv[2] || 99999;
    headCount = Math.min( array.length, headCount );
    var totalBagCount = process.argv[3]; // optional - generate a 'bag' of this many tuples

    var totalCount = 0; 
    for ( var i = 0; i < headCount; ++i ) {
       totalCount += array[i].count;         
    }

    for ( var i = 0; i < headCount; ++i ) {
        if ( totalBagCount ) {
            if ( totalBagCount > 0 ) { // with weighting
                var bagCount = Math.floor( totalBagCount * array[i].count / totalCount );
                console.log(`   Array.from( { length : ${ bagCount } }, () => ${ JSON.stringify( array[i].array ) } ),`); 
            } else { // without weighting
                console.log(`   ${ JSON.stringify( array[i].array ) },`); 
            }
        } else {
            console.log( JSON.stringify( array[i] ) );         
        }
    }
    
    
    process.exit();
});

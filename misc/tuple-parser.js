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
        current = current.toLowerCase();

        if ( previous && previous.match( /[a-z]/ ) &&
             current  && current.match( /[a-z]/ )) {
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
            array.push( { tuple : first+second, count : tuple[first][second] } );
        });
    });
    
    array.sort( function(a,b) {
       if ( a.count < b.count ) return 1; 
       if ( a.count > b.count ) return -1;
       return 0; 
    });
    
    array.forEach( function(el) {
       console.log( JSON.stringify(el) ); 
    });
    
    process.exit();
});

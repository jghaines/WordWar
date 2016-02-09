#!/usr/bin/env node
'use strict';

var readline = require('readline');

console.log( '<tbody>' );

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
	process.stdout.write( '\t<tr> ' );

	line.split('').forEach( function( letter ) {
		switch ( true ) {
			case ( '.' == letter ) : process.stdout.write( "<td/>" ); break; // blank cell

			case ( '<' == letter ) : process.stdout.write( "<td class='player-0'/>" ); break;
			case ( '>' == letter ) : process.stdout.write( "<td class='player-1'/>" ); break;

			case ( '_' == letter ) : process.stdout.write( "<td class='block'/>" ); break;
			case ( '?' == letter ) : process.stdout.write( "<td class='wildcard' ww_value='?'/>" ); break;
			case ( '2' == letter ) : process.stdout.write( "<td class='bonus letter' ww_value='2'/>" ); break;
			case ( '3' == letter ) : process.stdout.write( "<td class='bonus letter' ww_value='3'/>" ); break;
			case ( '4' == letter ) : process.stdout.write( "<td class='bonus letter' ww_value='4'/>" ); break;
			case ( '@' == letter ) : process.stdout.write( "<td class='bonus word' ww_value='2'/>" ); break;
			case ( '#' == letter ) : process.stdout.write( "<td class='bonus word' ww_value='3'/>" ); break;
			case ( '$' == letter ) : process.stdout.write( "<td class='bonus word' ww_value='4'/>" ); break;

			case ( letter >= 'A' &&
				   letter <= 'Z' ) : process.stdout.write( "<td class='static' ww_value='" + letter + "'/>" ); break;

		}
	});

	process.stdout.write( ' </tr>\n' );
})

rl.on('close', function(line){
	console.log( '</tbody>' );
})

 'use strict';
 
 // http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
function binaryIndexOf(searchElement) {
    var minIndex = 0;
    var maxIndex = this.length - 1;
    var currentIndex;
    var currentElement;
 
    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = this[currentIndex];
 
        if (currentElement < searchElement) {
            minIndex = currentIndex + 1;
        }
        else if (currentElement > searchElement) {
            maxIndex = currentIndex - 1;
        }
        else {
            return currentIndex;
        }
    }
 
    return -1;
}

function countWhere( callback ) {
    return this.reduce( function( previousValue, currentValue, currentIndex, array ) {
        return previousValue + ( callback( currentValue ) ? 1 : 0 );
    } , 0 );
}


// last array element where callback function returns true
function lastIndexWhere( callback ) {
    for ( var i = this.length -1; i >= 0; --i ) {
        if ( callback.call( this[i] ) ) {
            return i;
        }
    }
    return -1;
}

function firstIndexWhere( callback, fromIndex ) {
    fromIndex = (typeof fromIndex === 'undefined') ? 0 : fromIndex; // fromIndex defaults to 0
    for ( var i = fromIndex; i < this.length; ++i ) {
        if ( callback.call( this[i] ) ) {
            return i;
        }
    }
    return -1;
}

Array.prototype.binaryIndexOf   = binaryIndexOf;
Array.prototype.countWhere      = countWhere;
Array.prototype.lastIndexWhere  = lastIndexWhere;
Array.prototype.firstIndexWhere = firstIndexWhere;


// http://stackoverflow.com/questions/4878756/javascript-how-to-capitalize-first-letter-of-each-word-like-a-2-word-city
function toTitleCase() {
    return this.replace( /\w\S*/g, function( txt ) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

String.prototype.toTitleCase = toTitleCase;


function flash(element, flash_class) {
	$(element).addClass(flash_class);
    
    // remove class once animation is complete
    var animationDurcation = cssTimeToMilliseconds( $(element).css( 'animation-duration' ));
    setTimeout(function() {
          $(element).removeClass(flash_class);
    }, animationDurcation);
}

function cssTimeToMilliseconds( cssTime ) {
    var match;
    if ( ( match = cssTime.match( /^([\d\.]+)\s*ms$/ ) )) { // milliseconds
        return Math.floor( parseFloat( match[0] ));
    } else if ( ( match = cssTime.match( /^([\d\.]+)\s*s$/ ) )) { // seconds
        return Math.floor( parseFloat( match[0] ) * 1000 );
    } else {
        throw new Error( "cssTimeToMilliseconds() couldn't parse: " + cssTime );
    }
}

// http://stackoverflow.com/a/2117523/358224
function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

// whether the argument is null or undefined
function notNull( o ) {
    return ( o !== null && o !== undefined );
}

// simple string reverse function
// http://stackoverflow.com/questions/958908/how-do-you-reverse-a-string-in-place-in-javascript
// fine for us. won't work for complex utf-16
function naiveReverse( string ) {
    return string.split('').reverse().join('');
}
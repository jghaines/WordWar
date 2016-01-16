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
Array.prototype.lastIndexWhere  = lastIndexWhere;
Array.prototype.firstIndexWhere = firstIndexWhere;


function flash(element, flash_class) {
	$(element).addClass(flash_class);
    setTimeout(function() {
          $(element).removeClass(flash_class);
    }, 1000);
}

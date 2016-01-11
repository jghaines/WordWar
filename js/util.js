// http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
function binaryIndexOf(searchElement) {
    'use strict';
 
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


Array.prototype.binaryIndexOf = binaryIndexOf;



function flash(element, flash_class) {
	$(element).addClass(flash_class);
    setTimeout(function() {
          $(element).removeClass(flash_class);
    }, 1000);
}

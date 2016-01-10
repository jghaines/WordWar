function getRandomLetter() {
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var vowels = "AEIOU";
    var consonants = "BCDFGHJKLMNPQRSTVWXYZ";

    if ( Math.random() < 0.3 ) {
		return vowels.charAt(Math.floor(Math.random() * vowels.length));
    } else if ( Math.random() < 0.6 ) {
		return consonants.charAt(Math.floor(Math.random() * consonants.length));
	} else {
		return letters.charAt(Math.floor(Math.random() * letters.length));
	}

}

// whether the position selected for the letter is valid
function validPositionSelected(playedCell) {
	log.debug('validPositionSelected( ' + playedCell + ')');
	return $(playedCell).hasClass('playable');
}


// Whether the current letters that have been played are valid
function validWordPlayed() {
	// TODO - assume ok for now
	return true;
}


function loadBoard(url) {
	log.info('loadBoard('+url+')');
	$('table.gameboard').load( url, '', function() { // callback - after the board is loaded

		log.info('loadBoard() board height=' + $('table.gameboard tr').length);

		// fill the values
		$('table.gameboard td').filter(function() { return $(this).attr('ww_value'); }).each(function() {
			log.debug('.');
			$(this).text( $(this).attr('ww_value') );
		});
	});
}

function getPlayerCell() {
	return $("table.gameboard td.player");
}

function populateLetters( cells ) {
	$(cells).each(function() {
		$(this).text( getRandomLetter() );
	});
}

function clearLetterSelection() {
	$('table.letters td.selected').each(function() {
		$(this).removeClass( 'selected' );
	});
}

function flash(element, flash_class) {
	$(element).addClass(flash_class);
    setTimeout(function() {
          $(element).removeClass(flash_class);
    }, 1000);
}

function enablePlayButton() {
	var playButton = $("button.play");
	var isInPlay = ( $("table.gameboard td.inplay").length > 0 );
	playButton.prop('disabled', ! isInPlay );
	return isInPlay;
}

function unhighlightValidPositions() {
	$('table.gameboard td').removeClass( 'playable' );
}

function highlightValidPositions(){
	var inPlayCells =  $("table.gameboard td.inplay");
	var playerCell =  getPlayerCell();
	var playerColumnIndex = playerCell.index();
	var playerRowIndex = playerCell.parent().index();

	unhighlightValidPositions();

	if ( inPlayCells.length == 0 ) {
		log.info("highlightValidPositions() - direction == any");
		// no played cells - just highlight around player
		playerCell.prev().addClass( 'playable' ).attr( 'ww:direction', 'left' );
		playerCell.next().addClass( 'playable' ).attr( 'ww:direction', 'right' );
		playerCell.parent().prev().children().eq(playerColumnIndex).addClass( 'playable' ).attr( 'ww:direction', 'up' );
		playerCell.parent().next().children().eq(playerColumnIndex).addClass( 'playable' ).attr( 'ww:direction', 'down' );
	} else {
		var direction = $(inPlayCells).first().attr('ww:direction');
		log.info("highlightValidPositions() - direction == " + direction);
		var validPositions;
		switch(direction) {
    		case 'right':
    			validPositions = playerCell.siblings('td:gt('+playerColumnIndex+'):not(.inplay)').first();
	        break;
    		case 'up':
    			validPositions = playerCell.parent().siblings('tr:lt('+playerRowIndex+')').find('td:eq('+playerColumnIndex+'):not(.inplay)').last();
	        break;
		}
		validPositions.addClass( 'playable' );
		validPositions.attr( 'ww:direction', direction );

	}

	createGameboardBindings();
}

function selectLetterToPlay(selectedCell) {
	clearLetterSelection();

	if ( $(selectedCell).hasClass('inplay') ) { // if letter already inplay
		// don't select, just return
		return;
	}

	$(selectedCell).addClass( 'selected' );

	highlightValidPositions();
}


function playLetterOnGameBoard(playedCell) {	
	var selectedLetterCell = $('table.letters td.selected');
	var letterPlayed = selectedLetterCell.text();
	if (letterPlayed.length != 1 ) { // if no selected letter
		return;
	}

	if ( ! validPositionSelected(playedCell) ) {
		flash($('table.gameboard'), 'flash-red');
		return;
	}

	$(playedCell).addClass( 'inplay' );
	$(playedCell).text(letterPlayed)

	clearLetterSelection();
	$(selectedLetterCell).addClass( 'inplay' );

	unhighlightValidPositions();
	enablePlayButton();
}

function playWord() {
	if ( ! validWordPlayed () ) {
		// TODO
		flash('table.gameboard td.inplay', 'flash-red');
		return;
	}

	var inPlayCells = $('table.gameboard td.inplay');
	var direction = $(inPlayCells).first().attr('ww:direction');

	// move avatar
	var direction = $(inPlayCells).first().attr('ww:direction');
	log.info("highlightValidPositions() - direction == " + direction);
	switch(direction) {
		case 'right':
    		var playerCell = getPlayerCell();
    		inPlayCells.last().addClass( 'player' );
    		playerCell.removeClass('player');
        break;
		case 'up':
    		var playerCell = getPlayerCell();
    		inPlayCells.first().addClass( 'player' );
    		playerCell.removeClass('player');
        break;
	}

	flash(inPlayCells,'flash-magenta');
	inPlayCells.addClass('played');
	inPlayCells.removeClass('inplay');


	// repopulate inplay cells
	populateLetters( $('table.letters td.inplay') );
	$('table.letters td.inplay').removeClass('inplay');

}

function createGameboardBindings() {
	$('table.gameboard td').click( function(){
		playLetterOnGameBoard(this);
	} );
}

function createBindings() {
	$('table.letters td').click( function(){
		selectLetterToPlay(this);
	} );

	$("button.play").click( function(){
		playWord();
	} );

}

function main() {
	log.setLevel('DEBUG');
	log.info('main()');

	loadBoard('./boards/1.html');
	createBindings();
	populateLetters( $('table.letters td') ); // all cells
	enablePlayButton();	
}


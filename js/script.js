var scrabbleLetters = 
	"A".repeat(9) +
	"B".repeat(2) +
	"C".repeat(2) +
	"D".repeat(4) +
	"E".repeat(12) +
	"F".repeat(2) +
	"G".repeat(3) +
	"H".repeat(2) +
	"I".repeat(9) +
	"J".repeat(1) +
	"K".repeat(1) +
	"L".repeat(4) +
	"M".repeat(2) +
	"N".repeat(6) +
	"O".repeat(8) +
	"P".repeat(2) +
	"Q".repeat(1) +
	"R".repeat(6) +
	"S".repeat(4) +
	"T".repeat(6) +
	"U".repeat(4) +
	"V".repeat(2) +
	"W".repeat(2) +
	"X".repeat(1) +
	"Y".repeat(2) +
	"Z".repeat(1);

function getRandomLetter() {
    return scrabbleLetters.charAt(Math.floor(Math.random() * scrabbleLetters.length));
}

// whether the position selected for the letter is valid
function validPositionSelected(playedCell) {
	log.debug('validPositionSelected( ' + playedCell + ')');
	return $(playedCell).hasClass('playable');
}


function getWordPlayed() {
	return 	$.map( $('table.gameboard .inplay'), function( val, i ) {
	  return $(val).text();
	}).join('');
}

// Whether the current letters that have been played are valid
function validWordPlayed(word) {
	return ( sowpods.binaryIndexOf( word ) >= 0 );
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
    		case 'left':
    			validPositions = playerCell.siblings('td:lt('+playerColumnIndex+'):not(.inplay)').last();
	        break;
    		case 'right':
    			validPositions = playerCell.siblings('td:gt('+playerColumnIndex+'):not(.inplay)').first();
	        break;
    		case 'up':
    			validPositions = playerCell.parent().siblings('tr:lt('+playerRowIndex+')').find('td:eq('+playerColumnIndex+'):not(.inplay)').last();
	        break;
    		case 'down':
    			validPositions = playerCell.parent().siblings('tr:gt('+playerRowIndex+')').find('td:eq('+playerColumnIndex+'):not(.inplay)').first();
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
	var wordPlayed = getWordPlayed();
	if ( ! validWordPlayed (wordPlayed) ) {
		// TODO
		flash('table.gameboard td.inplay', 'flash-red');
		return;
	}

	var inPlayCells = $('table.gameboard td.inplay');
	var direction = $(inPlayCells).first().attr('ww:direction');

	// move avatar
	var direction = $(inPlayCells).first().attr('ww:direction');
	log.info("highlightValidPositions() - direction == " + direction);
	var playerCell = getPlayerCell();
	var newPlayerCell;
	switch(direction) {
		case 'right': // fall through
		case 'down':
    		newPlayerCell = inPlayCells.last().addClass( 'player' );
        break;
		case 'left': // fall through
		case 'up':
    		newPlayerCell = inPlayCells.first().addClass( 'player' );
        break;
	}
	newPlayerCell.addClass( 'player' );
	playerCell.removeClass('player');

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


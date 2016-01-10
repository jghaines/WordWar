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
function validPositionSelected() {
	// TODO - assume ok for now
	return true;
}


// Whether the current letters that have been played are valid
function validWordPlayed() {
	// TODO - assume ok for now
	return true;
}

function loadBoard(url) {
	$('table.gameboard').load( url );
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

function enablePlayButton() {
	var playButton = $("button.play");
	var isInPlay = ( $("table.gameboard td.inplay").length > 0 );
	playButton.prop('disabled', ! isInPlay );
	return isInPlay;
}

function highlightValidPositions(){
	var inPlayCells =  $("table.gameboard td.inplay");
	var playerCell =  $("table.gameboard td.player");

	$('table.gameboard td').removeClass( 'playable' );



	if ( inPlayCells.length == 0 ) {
		var columnIndex = $(playerCell).index();
		// no played cells - just highlight around player
		$(playerCell).next().addClass( 'playable' ); // left
		$(playerCell).prev().addClass( 'playable' ); // right
		$(playerCell).parent().prev().children().eq(columnIndex).addClass('playable'); // up
		$(playerCell).parent().next().children().eq(columnIndex).addClass('playable'); // down
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

	if ( ! validPositionSelected() ) {
		// TODO
		alert('Invalid position selected');
		return;
	}

	$(playedCell).text(letterPlayed)
	$(playedCell).addClass( 'inplay' );

	clearLetterSelection();
	$(selectedLetterCell).addClass( 'inplay' );

	enablePlayButton();
}

function playWord() {
	if ( ! validWordPlayed () ) {
		// TODO
		alert('Invalid word played');
		return;
	}

	$('table.gameboard td.inplay').addClass('played');
	$('table.gameboard td.inplay').removeClass('inplay');

	// repopulate inplay cells
	populateLetters( $('table.letters td.inplay') );
	$('table.letters td.inplay').removeClass('inplay');

}

function createGameboardBindings() {
	$('table.gameboard td.playable').click( function(){
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
	loadBoard('./boards/1.html');
	createBindings();
	populateLetters( $('table.letters td') ); // all cells
	enablePlayButton();	
}


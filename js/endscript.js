$('table.letters td').click( function(){
	selectLetterToPlay(this);
} );

$('table.gameboard td').click( function(){
	playLetterOnGameBoard(this);
} );

$("button.play").click( function(){
	playWord();
} );


main();

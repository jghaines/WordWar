"use strict";

function GameController(boardModel, boardView, lettersModel, lettersView) {

	this.createBindings = function() {
		log.info('GameController.createBindings()');
		this._lettersView.click( (function(index, letter) {
			this.selectLetterToPlace(index, letter);
		}).bind(this) );

		this._boardView.click( (function(cell) {
			this.selectCellToPlace(cell);
		}).bind(this) );
		this._buttonsView.clickPlay( (function() {
			this.playWord();
		}).bind(this) );
	}

	this.populateLetters = function () {
		log.info('GameController.populateLetters()');
		for (var i = this._lettersModel.letterCount() - 1; i >= 0; i--) {
			this._lettersModel.setLetter(i, this._letterGenerator() );
		};

		this._lettersView.updateLetters();
	}

	this.selectLetterToPlace = function(index, letter) {
		log.info('GameController.selectLetterToPlace(index=' + index + ', letter=' + letter + ')');
		log.debug('GameController.selectLetterToPlace  (this=' + this + ')');

		if ( this._lettersModel.isPlaced(index) ) {
			// don't select, just return
			return;
		}

		this._lettersModel.select(index);
		this._lettersView.updateSelection();
		this._boardController.highlightPlaceablePositions();
	}

	this.selectCellToPlace = function(cell) {
		log.info('GameController.selectCellToPlace(.)');
		if ( this._lettersModel.getSelectedIndex() < 0 ) { // no letter selected
			// nudge the user
			this._lettersView.flash('flash-selection');
			return;
		}

		if ( ! this._boardModel.isCellPlaceable(cell) ) { // invalid placement
			this._boardView.flash('flash-error');
			return;
		}

		// valid placement
		this._boardModel.placeLetter(cell,this._lettersModel.getSelectedLetter());
		this._lettersModel.setPlaced(this._lettersModel.getSelectedIndex, true);
		this._lettersModel.unselect();
		this._lettersView.updateSelection();
		this._boardController.unhighlightPlaceablePositions();
		this._buttonsView.enablePlayButton(true);
	}

	// Whether the given word is valid
	this.validWordPlaced = function(word) {
		return ( sowpods.binaryIndexOf( word ) >= 0 );
	}

	this.playWord = function() {
		var wordPlaced = this._boardModel.getPlacedWord();

		if ( ! this.validWordPlaced (wordPlaced) ) {
			this._boardView.flash('flash-error');
			return;
		}

		var playerNewCell = this._boardModel.getEndOfWordCell();
		this._boardModel.setPlayerCell(playerNewCell);

		var placedCells = this._boardModel.getPlacedCells();
		this._boardModel.setPlayedCells(placedCells, 'player');
	}


	// constructor code
	this._lettersModel = new LettersModel();
	this._lettersView = new LettersView(this._lettersModel );

	this._boardModel = new BoardModel();
	this._boardView = new BoardView(this._boardModel);
	this._boardController = new BoardController( this._boardModel, this._boardView );

	this._buttonsView = new ButtonsView();

	this._letterGenerator = getScrabbleLetter;

	this.populateLetters();
	this._boardModel.loadBoard('./boards/1.html', (function() { 
		this.createBindings();
		this._boardModel.setPlayedCells(this._boardModel.getPlayerCell(), 'player');

	}).bind(this));



}

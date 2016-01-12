"use strict";

function GameController(remote) {

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
			this._lettersModel.setPlaced(i, false);
		};
		this._lettersModel.unselect();

		this._lettersView.updateLetters();
		this._lettersView.updatePlaced();
		this._lettersView.updateSelection();
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
		if ( this._lettersModel.getSelectedIndex() == null ) { // no letter selected
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
		this._lettersModel.setPlaced(this._lettersModel.getSelectedIndex(), true);
		this._lettersModel.unselect();
		this._lettersView.updateSelection();
		this._lettersView.updatePlaced();
		this._boardController.unhighlightPlaceablePositions();
		this._buttonsView.enablePlayButton(true);
	}

	// Whether the given word is valid
	this.validWordPlaced = function(word) {
		return ( sowpods.binaryIndexOf( word ) >= 0 );
	}

	this.playWord = function() {
 		log.info('GameController.playWord(.)');
		var wordPlaced = this._boardModel.getPlacedWord();

		if ( ! this.validWordPlaced (wordPlaced) ) {
			this._boardView.flash('flash-error');
			return;
		}

		var playerNewCell = this._boardModel.getEndOfWordCell();

		this._remote.play(
			this._boardModel.getPlacedWord(),
			this._boardModel.getPlacedScore(),
			this._boardModel.getPlacedRange(),
			this._boardModel.getCellCoordinates( playerNewCell )
		);
 
 		this._buttonsView.enablePlayButton(false);
 		this._state.localMove(this);
 	}

 	this.remotePlayedWord = function(msg) {
 		log.info('GameController.remotePlayedWord(.)');
 		this._state.remoteMove(this);
 	}

	// State machine callback
 	this.moveComplete = function() {
 		this.executePlay( 'local', this._remote.getLocalPlay() );
	}


	this.executePlay = function(who, play) {
		this._boardModel.setPlayerCell(who, play.newPosition);


// TODO

		var placedCells = this._boardModel.getPlacedCells();
		this._boardModel.setPlayedCells(placedCells, 'player');

		this._boardModel.unplaceAll();

		// prepare for next move
		this.populateLetters();

		this._state.moveComplete(this);
	}

	// State machine callback
	this.setState = function(state) {
		this._state = state;
	}

	// constructor code
	this._remote = remote;
	this._remote.onPlayReceived( (function(msg) { 
		this.remotePlayedWord(msg);
	}).bind(this));

	this.setState( new StateInitial(this) );


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
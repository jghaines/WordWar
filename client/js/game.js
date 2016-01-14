"use strict";

function GameController(remote) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.createBindings = function() {
		this.log.info('GameController.createBindings()');

		this._lettersView.onClick( (function(index, letter) {
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
		this.log.info('GameController.populateLetters()');

		for (var i = this._lettersModel.getLetterCount() - 1; i >= 0; i--) {
			this._lettersModel.setLetter(i, this._letterGenerator() );
			this._lettersModel.setPlaced(i, false);
		};
		this._lettersModel.unselect();

		this._lettersView.updateLetters();
		this._lettersView.updatePlaced();
		this._lettersView.updateSelection();
	}

	this.newGame = function(gameInfo) {
		var boardUrl = gameInfo.board;

		this._lettersModel.setLetterCount( gameInfo.letterCount );
		this._lettersView.updateLetters();

		this.populateLetters();

		this._boardModel.loadBoard(boardUrl, (function() { 
			this.boardLoaded();
		}).bind(this));
	}

	this.boardLoaded = function() {

		this.createBindings();

		this._boardModel.addPlayedRange( 'local',  this._boardModel.getCellRange( this._boardModel.getPlayerCell('local' ) ));
		this._boardModel.addPlayedRange( 'remote', this._boardModel.getCellRange( this._boardModel.getPlayerCell('remote') ));
	}

	this.selectLetterToPlace = function(index, letter) {
		this.log.info('GameController.selectLetterToPlace(index=' + index + ', letter=' + letter + ')');
		this.log.debug('GameController.selectLetterToPlace  (this=' + this + ')');

		if ( this._lettersModel.isPlaced(index) ) {
			// don't select, just return
			return;
		}

		this._lettersModel.select(index);
		this._lettersView.updateSelection();
		this._boardController.highlightPlaceablePositions();
	}

	this.selectCellToPlace = function(cell) {
		this.log.info('GameController.selectCellToPlace(.)');
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
 		this.log.info('GameController.playWord(.)');
		var wordPlaced = this._boardModel.getPlacedWord();

		if ( ! this.validWordPlaced (wordPlaced) ) {
			this._boardView.flash('flash-error');
			return;
		}

 		this._buttonsView.enablePlayButton(false);

		var myPlay = new Play(
			this._boardModel.getPlacedWord(),
			this._boardModel.getPlacedScore(),
			this._boardModel.getPlacedRange(),
			this._boardModel.getCellCoordinates( this._boardModel.getEndOfWordCell() )
		);

		this._stateContext.localMove( myPlay );
 	}

	// State machine callback - local player and remote compnent have completed move
 	this.moveComplete = function() {
 		// show the local player updates
 		this.executePlay( 'local',  this._stateContext.getLocalPlay() );

 		// map the remote play coordinates
		var remotePlay = this._stateContext.getRemotePlay();
 		remotePlay.newPosition = this._boardModel.rotatePosition( remotePlay.newPosition );
 		remotePlay.playRange   = this._boardModel.rotateRange( remotePlay.playRange );
 		// show the remote player updates
		this.executePlay( 'remote', remotePlay );

		this._boardModel.unplaceAll();

		// prepare for next move
		this.populateLetters();
	}


	this.executePlay = function(who, play) {
		this.log.info('GameController.executePlay(who=' + who + ', play=.)')
		this._boardModel.setPlayerCell(who, play.newPosition);
		this._boardModel.addPlayedRange(who, play.playRange);
	}

	// constructor code
	this._remote = remote;
	this._stateContext = new StateContext( this._remote );

	this._lettersModel = new LettersModel();
	this._lettersView = new LettersView(this._lettersModel );

	this._boardModel = new BoardModel();
	this._boardView = new BoardView(this._boardModel);
	this._boardController = new BoardController( this._boardModel, this._boardView );

	this._buttonsView = new ButtonsView();

	this._letterGenerator = getScrabbleLetter;
	
	this._stateContext.onNewGame( (function(msg) { 
		this.newGame(msg);
	}).bind(this));

	this._stateContext.onMoveComplete( (function() {
		this.moveComplete();
	}).bind(this) );

}

"use strict";

function GameController( remoteProxy, scoreStrategy, attackRangeStrategy ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.INFO );

	this.newGame = function(gameInfo) {
		this.log.info( this.constructor.name + '.newGame(.)' );
		this.log.debug( this.constructor.name, '.newGame( gameInfo=', gameInfo, ')' );

		var boardUrl = gameInfo.board;
		this.playerIndex = gameInfo.playerIndex;
		this.playerCount = gameInfo.playerCount;

		this._lettersModel.setLetterCount( gameInfo.letterCount );
		this._lettersView.updateLetters();

		for (var p = this.playerCount - 1; p >= 0; p--) {
			this._scoreModel.setScore( p, gameInfo.startScore );
			this._scoreModel.setLost( p, false );
		}

		this._boardModel.loadBoard(	boardUrl );

		this._audio.newGame();
	}

	// called back when board has loaded
	this._boardLoaded = function() {
		// mark starting position as played for cosmetics
		for (var p = this.playerCount - 1; p >= 0; p--) {
			this._boardController.addPlayedRange( p, this._boardModel.getCellRange( this._boardModel.getPlayerCell( p ) ));
		}
	}

	this.newTurn = function( turnInfo ) {
		this.log.info( this.constructor.name + '.newTurn(.)' );
		this.log.debug( this.constructor.name, '.newTurn( turnInfo=', turnInfo, ')' );

		for ( var i = turnInfo.letters.length - 1; i >= 0; i-- ) {
			this._lettersModel.setLetter(i, turnInfo.letters[i] );
			this._lettersModel.setPlaced(i, false);
		};
		this._lettersModel.unselect();

		this._lettersView.updateLetters();
		this._lettersView.updatePlaced();
		this._lettersView.updateSelection();
		this._lettersView.setEnabled( true );

		this._buttonsView.enableMoveButton(   false );
		this._buttonsView.enableAttackButton( false );
		this._buttonsView.enableResetButton(  false );
	}

	this.selectLetterToPlace = function(index, letter) {
		this.log.info(this.constructor.name, '.selectLetterToPlace(index=' + index + ', letter=' + letter + ')');
		this.log.debug('GameController.selectLetterToPlace  (this=' + this + ')');

		if ( this._lettersModel.isPlaced(index) ) {
			// don't select, just return
			return;
		}

		this._lettersModel.select(index);
		this._lettersView.updateSelection();
		this._boardController.highlightPlaceablePositions( this.playerIndex );
	}

	this.placeLetterOnBoard = function( cell ) {
		this.log.info( this.constructor.name + '.placeLetterOnBoard(.)');

		if ( this._lettersModel.getSelectedIndex() == null ) { // no letter selected
			// nudge the user
			this._lettersView.flash('flash-selection');
			return;
		}

		if ( ! this._boardModel.isCellPlaceable( cell )) { // invalid placement
			this._boardView.flash('flash-error');
			return;
		}

		// valid placement
		this._boardModel.placeLetter( cell, this._lettersModel.getSelectedLetter() );
		this._lettersModel.setPlaced( this._lettersModel.getSelectedIndex(), true );
		this._lettersModel.unselect();
		this._lettersView.updateSelection();
		this._lettersView.updatePlaced();
		this._boardController.unhighlightPlaceablePositions();
		this._buttonsView.enableMoveButton(  true );
		this._buttonsView.enableResetButton( true );

		if ( this._scoreModel.getAttackMultiplier() > 0 && this.isAttackInRange() ) {

			this._buttonsView.enableAttackButton( true );

			var localPlayerCoords = this._boardModel.getCoordinatesForCell( this._boardModel.getPlayerCell( this.playerIndex ))
			var placedRange = this._boardModel.getPlacedRange();
			var strategy = this._attackRangeStrategy;
			this._boardController.highlightAttackableWhere( function( _ignore_cell, coords ) {
				return ( strategy.isAttackInRange( localPlayerCoords, coords, placedRange ));
			});
		} else {
			this._buttonsView.enableAttackButton( false );
		}
	}

	this.isAttackInRange = function() {
		for (var p = this.playerCount - 1; p >= 0; p--) { // check the other players
			if ( 	p != this.playerIndex && // can't attack ourself
					this._attackRangeStrategy.isAttackInRange(
						this._boardModel.getCoordinatesForCell( this._boardModel.getPlayerCell( this.playerIndex )),
						this._boardModel.getCoordinatesForCell( this._boardModel.getPlayerCell( p )),
						this._boardModel.getPlacedRange() )) {
				return true;
			}
		}
	}

	// Whether the given word is valid
	this.validWordPlaced = function(word) {
		return ( sowpods.binaryIndexOf( word ) >= 0 );
	}

	// user has clicked Move or Attack
	this.playWord = function( moveType ) {
		this.log.info( this.constructor.name + '.playMove(' + moveType + ')');
		var wordPlaced = this._boardModel.getPlayedWord( this.playerIndex );

		if ( ! this.validWordPlaced (wordPlaced) ) {
			this._boardView.flash('flash-error');
			return;
		}

		var myPlay = new Play(
			this.playerIndex,
			moveType,
			this._boardModel.getPlayedWord( this.playerIndex ),
			this._boardController.getPlayedScore( this.playerIndex ),
			this._boardModel.getPlacedRange(),
			this._boardModel.getCoordinatesForCell( this._boardController.getEndOfWordCell( this.playerIndex ) ),
			this._scoreModel.getAttackMultiplier()
		);

		this._lettersModel.unselect();
		this._lettersView.updateSelection();

		this._boardController.unhighlightPlaceablePositions();

 		this._buttonsView.enableMoveButton(   false );
 		this._buttonsView.enableAttackButton( false );
		this._buttonsView.enableResetButton(  false );
		this._lettersView.setEnabled( false );

		this._stateContext.localMove( myPlay );

 	}

	this.resetWord = function() {
		this.log.info( this.constructor.name + '.resetWord(.)');
		this._boardController.resetWord();

		this._lettersModel.unplaceAll();
		this._lettersModel.unselect();
		this._lettersView.updatePlaced();
		this._lettersView.updateSelection();

		this._buttonsView.enableMoveButton(   false );
		this._buttonsView.enableAttackButton( false );
		this._buttonsView.enableResetButton(  false );
 	}

	// State machine callback - local player and remote compnent have completed move
		this.endTurn = function() {
		this.log.info( this.constructor.name + '.endTurn()' );

		this._boardController.resetWord();
		this._boardController.unhighlightAttackable();

		var plays = this._stateContext.getPlays();
		var localPlay  = plays[ this.playerIndex ];
		var remotePlay = plays[ 1 - this.playerIndex ];

			var gameEnded = this.updateScore( plays );

			var movePlays = [];
			var attackPlays = [];
		for (var p = plays.length - 1; p >= 0; p--) {
			switch ( plays[p].moveType ) {
				case 'move':
					movePlays.push( plays[p] );
					break;
				case 'attack':
					attackPlays.push( plays[p] );
					break;
			}
		}


		if ( attackPlays.length > 0 ) { // attacks, if any, shown first
			this._audio.attack();

			for (var p = attackPlays.length - 1; p >= 0; p--) {
				this.executeAttack( attackPlays[p] );
			}
			if ( movePlays.length > 0 ) { // move vs attack, shown next
				setTimeout( (function() { 
					for (var p = movePlays.length - 1; p >= 0; p--) {
						this.executeMove( movePlays[p] );
					}
				}).bind( this ), 700 );
			}
		} else { // only moves
			this._audio.move();
			for (var p = movePlays.length - 1; p >= 0; p--) {
				this.executeMove( movePlays[p] );
			}
		}

		for (var p = plays.length - 1; p >= 0; p--) {
			this.addPlayedItem( plays[p] );
		}

		if ( gameEnded ) {
				this.endGame();
			}
	}

	// update score, return true if game has ended
 	this.updateScore = function( plays ) {
		this.log.info( this.constructor.name + '.updateScore(.)');
		this._scoreStrategy.calculateScore( plays );

		this._scoreModel.setAttackMultiplier( plays[ this.playerIndex ].attackMultiplier );

		for (var i = plays.length - 1; i >= 0; i--) {
			this._scoreModel.incrementScore( i, plays[i].score );
			if ( this._scoreModel.getScore( i ) < 0 ) {
				this._scoreModel.setLost( i, true );
				return true;
			}
		}

		return false;
	}

	this.executeMove = function( play ) {
		this.log.info( this.constructor.name + '.executeMove(play=.)' );
		this._boardController.setPlayerCell( play.playerIndex, play.newPosition );
		this._boardController.addPlayedRange( play.playerIndex, play.playRange );
	}

	// execute attack initiated by giver play(-er)
	this.executeAttack = function( play ) {
		this.log.info( this.constructor.name + '.executeAttack(play=.)' );
		this._boardController.addPlayedRange( play.playerIndex, play.playRange );
		this._boardView.flashAttackOnPlayer( 1 - play.playerIndex ); // TODO: this is hard-coded for 2-player, should be generic
	}

	this.addPlayedItem = function( play ) {
		this.log.info( this.constructor.name + '.addPlayedItem(play=.)' );
		this._boardView.addPlayedItem( play.playerIndex,
			play.moveType.toTitleCase() + ': ' + play.word +
			'(' + play.wordValue + ') ' +
			( play.score > 0 ? '+' : '' ) +
			play.score,
			play.moveType
		);
	}

	this.endGame = function() {
		this.log.info( this.constructor.name + '.endGame())' );
		this.statusUpdate( 'End of Game' );
		this._lettersView.setEnabled( false );

		this._buttonsView.enableMoveButton(   false );
		this._buttonsView.enableAttackButton( false );
		this._buttonsView.enableResetButton(  false );		
	 }

	// State machine callback
	this.statusUpdate = function ( statusMessage ) {
		this._boardView.setStatus( statusMessage );
	}

	// constructor code
	this._audio = new AudioProxy();

	this._remote = remoteProxy;
	this._scoreStrategy = scoreStrategy;
	this._attackRangeStrategy = attackRangeStrategy;
	this._stateContext = new StateContext( this._remote );

	this._lettersModel = new LettersModel();
	this._lettersView = new LettersView(this._lettersModel );
	this._lettersView.setEnabled( true );

	this._boardModel = new BoardModel();
	this._boardView = new BoardView(this._boardModel);
	this._boardController = new BoardController( this._boardModel, this._boardView );

	this._scoreModel = new ScoreModel();

	this._buttonsView = new ButtonsView();
	this._buttonsView.enableMoveButton(   false );
	this._buttonsView.enableAttackButton( false );
	this._buttonsView.enableResetButton(  false );
	this._buttonsView.setPlayerModel( this._scoreModel );

	// bind all the things
	this._lettersView.onClick( (function(index, letter) {
		this.selectLetterToPlace(index, letter);
	}).bind(this) );

	this._boardModel.onBoardLoaded(( function() {
		this._boardLoaded()
	}).bind( this ));

	this._boardView.onClick( (function(cell) {
		this.placeLetterOnBoard(cell);
	}).bind(this) );

	this._stateContext.onNewGame( (function(msg) { 
		this.newGame(msg);
	}).bind(this));

	this._stateContext.onNewTurn( (function(msg) { 
		this.newTurn(msg);
	}).bind(this));

	this._stateContext.onendTurn( (function() {
		this.endTurn();
	}).bind(this) );

	this._stateContext.onStatusUpdate( (function(statusMessage) {
		this.statusUpdate(statusMessage);
	}).bind(this) );

	this._buttonsView.onMoveClicked( (function() {
		this.playWord('move');
	}).bind(this) );

	this._buttonsView.onAttackClicked( (function() {
		this.playWord('attack');
	}).bind(this) );

	this._buttonsView.onResetClicked( (function() {
		this.resetWord();
	}).bind(this) );

}

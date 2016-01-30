"use strict";

function GameController( remoteProxy, scoreStrategy, attackRangeStrategy ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.INFO );

	this.newGame = function(gameInfo) {
		this.log.info( this.constructor.name + '.newGame(.)' );
		this.log.debug( this.constructor.name, '.newGame( gameInfo=', gameInfo, ')' );

		var boardUrl = gameInfo.board;

		this._lettersModel.setLetterCount( gameInfo.letterCount );
		this._lettersView.updateLetters();

		this._scoreModel.setScore( 'local',  gameInfo.startScore );
		this._scoreModel.setScore( 'remote', gameInfo.startScore );
		this._scoreModel.setLost( 'local', false );
		this._scoreModel.setLost( 'remote', false );

		this._boardModel.loadBoard(	boardUrl );
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
		this._boardController.highlightPlaceablePositions();
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

		if ( this._attackRangeStrategy.isAttackInRange(
				this._boardModel.getCoordinatesForCell( this._boardModel.getPlayerCell( 'local' )),
				this._boardModel.getCoordinatesForCell( this._boardModel.getPlayerCell( 'remote' )),
				this._boardModel.getPlacedRange() )) { // if attack is in range

			this._buttonsView.enableAttackButton( true );

			var localPlayerCoords = this._boardModel.getCoordinatesForCell( this._boardModel.getPlayerCell( 'local' ))
			var placedRange = this._boardModel.getPlacedRange();
			var strategy = this._attackRangeStrategy;
			this._boardController.highlightAttackableWhere( function( _ignore_cell, coords ) {
				return ( strategy.isAttackInRange( localPlayerCoords, coords, placedRange ));
			});

		} else {
			this._buttonsView.enableAttackButton( false );			
		}
	}

	// Whether the given word is valid
	this.validWordPlaced = function(word) {
		return ( sowpods.binaryIndexOf( word ) >= 0 );
	}

	/* user has clicked Move or Attack */ 
	this.playWord = function( moveType ) {
		this.log.info( this.constructor.name + '.playMove(' + moveType + ')');
		var wordPlaced = this._boardModel.getPlayedWord();

		if ( ! this.validWordPlaced (wordPlaced) ) {
			this._boardView.flash('flash-error');
			return;
		}

 		this._buttonsView.enableMoveButton(   false );
 		this._buttonsView.enableAttackButton( false );
		this._buttonsView.enableResetButton(  false );
		this._lettersView.setEnabled( false );

		var myPlay = new Play(
			moveType,
			this._boardModel.getPlayedWord(),
			this._boardController.getPlayedScore(), //
			this._boardModel.getPlacedRange(),
			this._boardModel.getCoordinatesForCell( this._boardModel.getEndOfWordCell() )
		);

		this._stateContext.localMove( myPlay );
 	}

	this.resetWord = function() {
		this.log.info( this.constructor.name + '.resetWord(.)');
		this._boardController.resetWord();
		this._boardController.unhighlightAttackable();

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

		this._boardModel.unplaceAll();

		var localPlay  = this._stateContext.getLocalPlay();
		var remotePlay = this._stateContext.getRemotePlay();
 		// map the remote play coordinates
 		remotePlay.newPosition = remotePlay.newPosition.getRotated( this._boardModel.getBoardRange() );
 		remotePlay.playRange   = remotePlay.playRange.getRotated( this._boardModel.getBoardRange() );

 		if ( 'move' == localPlay.moveType && 'move' == remotePlay.moveType ) {
	 		// show the local player updates
	 		this.executeMove( 'local',  localPlay );
			this.executeMove( 'remote', remotePlay );
 		} else if ( 'attack' == localPlay.moveType && 'move' == remotePlay.moveType ) {
	 		// show the local player updates
	 		this.executeAttack( 'local',  localPlay );
			setTimeout( (function() { 
				this.executeMove( 'remote', remotePlay );
			}).bind( this ), 700 );

 		} else if ( 'move' == localPlay.moveType && 'attack' == remotePlay.moveType ) {
	 		// show the local player updates
	 		this.executeAttack( 'remote',  remotePlay );
			setTimeout( (function() { 
				this.executeMove( 'local', localPlay );
			}).bind( this ), 700 );

 		} else if ( 'attack' == localPlay.moveType && 'attack' == remotePlay.moveType ) {
	 		// show the local player updates
	 		this.executeAttack( 'remote',  remotePlay );
			this.executeAttack( 'local',   localPlay );
 		}

 		// if players have landed on same cell, retreat both players
 		if ( this._boardController.arePlayersOnSameCell() ) {
 			this.knockBackPlayer( localPlay );
 			this.knockBackPlayer( remotePlay );
			this._boardModel.setPlayerCell( 'local', localPlay.newPosition );
			this._boardModel.setPlayerCell( 'remote', remotePlay.newPosition );
 		}

 		var gameEnded = this.updateScore( localPlay, remotePlay );
		this.addPlayedItem( 'local',  localPlay );
		this.addPlayedItem( 'remote', remotePlay );

		if ( gameEnded ) {
 			this.endGame();
 		}
	}

	// update score, return true if game has ended
 	this.updateScore = function( localPlay, remotePlay ) {
		this._scoreStrategy.calculateScore( localPlay, remotePlay );

		this._scoreModel.incrementScore( 'local',  localPlay.score );
		this._scoreModel.incrementScore( 'remote', remotePlay.score );

		if ( this._scoreModel.getScore( 'local' ) < 0 ) {
			this._scoreModel.setLost( 'local', true );
			return true;
		}

		if ( this._scoreModel.getScore( 'remote' ) < 0 ) {
			this._scoreModel.setLost( 'remote', true );
			return true;
		}
		return false;
	}

	this.executeMove = function( who, play ) {
		this.log.info( this.constructor.name + '.executeMove(who=' + who + ', play=.)' );
		this._boardModel.setPlayerCell( who, play.newPosition );
		this._boardController.addPlayedRange( who, play.playRange );
	}

	this.executeAttack = function( who, play ) {
		this.log.info( this.constructor.name + '.executeAttack(who=' + who + ', play=.)' );
		this.executeMove( who, play );
		this._boardView.flashAttackOnPlayer( 'local' == who ? 'remote' : 'local' );
	}

	this.addPlayedItem = function( who, play ) {
		this.log.info( this.constructor.name + '.addPlayedItem(who=' + who + ', play=.)' );
		this._boardView.addPlayedItem( who,
			play.moveType.toTitleCase() + ': ' + play.word +
			'(' + play.wordValue + ') ' +
			( play.score > 0 ? '+' : '' ) +
			play.score,
			play.moveType
		);
	}

	this.knockBackPlayer = function( play ) {
		this.log.info( this.constructor.name + '.knockBackPlayer(.)' );
		if ( play.playRange.min.row == play.playRange.max.row ) { // horizontal move
			if ( play.newPosition.col < play.playRange.max.col ) {
				play.newPosition.col++;
			} else if ( play.playRange.min.col < play.newPosition.col ) {
				play.newPosition.col--;
			} else {
				throw new Error ( this.constructor.name + '.retreatPlayer() uhnhandled horizontal retreat');
			}

		} else if ( play.playRange.min.col == play.playRange.max.col ) { // vertical move
			if ( play.newPosition.row < play.playRange.max.row ) {
				play.newPosition.row++;
			} else if ( play.playRange.min.row < play.newPosition.row ) {
				play.newPosition.row--;
			} else {
				throw new Error ( this.constructor.name + '.retreatPlayer() uhnhandled vertical retreat');
			}

		} else {
			throw new Error ( this.constructor.name + '.retreatPlayer() uhnhandled directional retreat');			
		}
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
	this._ATTACK_MULTIPLIER = 2; // attacks are double damange

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
	
	// bind all the things
	this._lettersView.onClick( (function(index, letter) {
		this.selectLetterToPlace(index, letter);
	}).bind(this) );

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

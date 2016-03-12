"use strict";

function GameController( remoteProxy, scoreStrategy, attackRangeStrategy ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.INFO );

    // remote callback when we receive gameInfo from remote
    // will start the game when required
    this._receiveGameInfo = function( gameInfo ) {
		this.log.info( this.constructor.name + '._receiveGameInfo(.)' );
        if ( this.state !== GameState.NOT_STARTED ) {
            return; // ignore redundant updates
        }
        
        this.gameId = gameInfo.gameId;
        this.playerCount = gameInfo.playerCount;
        var boardUrl = gameInfo.board;
		this._boardModel.loadBoard(	boardUrl );

        if ( this.playerCount === gameInfo.playerList.length ) { // game is full, we can start
    		this.log.debug( this.constructor.name, '_receiveGameInfo() - game starting' );

            this.playerIndex = null;
            gameInfo.playerList.forEach( (function( playerInList, indexInList ) {
                if ( playerInList.playerId === this._remote.playerId ) {
                    this.playerIndex = indexInList;
                }
            }).bind(this));
            if ( this.playerIndex === null ) {
                throw new Error( "Received gameInfo for gameId=" + gameInfo.gameId + " which we (playerId=" + this._remote.playerId + ") are not a member" );
            }
            
    		this.turnIndex = 0;

            this._lettersModel.setLetterCount( gameInfo.letterCount );
            this._lettersView.updateLetters();

            for (var p = this.playerCount - 1; p >= 0; p--) {
                this._scoreModel.setScore( p, gameInfo.startScore );
                this._scoreModel.setLost( p, false );
            }
            this.checkForGameStart();
        }
    }

	// called back when board has loaded
	this._boardLoaded = function() {
		// mark starting position as played for cosmetics
		for (var p = this.playerCount - 1; p >= 0; p--) {
			this._boardController.addPlayedRange( p, this._boardModel.getCellRange( this._boardModel.getPlayerCell( p ) ));
		}
        this._isBoardLoaded = true;
        this.checkForGameStart();
	}
    
    // check if we are ready, then start the game
    this.checkForGameStart = function() {
		this.log.info( this.constructor.name + '.checkForGameStart(.)' );

        // return if we aren't ready
        if ( this.state !== GameState.NOT_STARTED ||
            ! this._isBoardLoaded ||
            this.playerIndex === null ||
            this._letterTiles.length < 1 
        ) {
            this.log.debug( this.constructor.name + '.checkForGameStart() - not ready yet' );
            return;
        }
		this.log.debug( this.constructor.name + '.checkForGameStart() - ready!' );

        this.state = GameState.PLAYER_MOVE;
        this.turnIndex = 0;
        this.newTurn();

    	this._audio.newGame();
	    this._boardView.setStateMood( this.state );
    }            

	this.newTurn = function() {
		this.log.info( this.constructor.name + '.newTurn(.)' );

		for ( var i = this._letterTiles[ this.turnIndex ].length - 1; i >= 0; i-- ) {
			this._lettersModel.setLetter(i, this._letterTiles[ this.turnIndex ][ i ] );
			this._lettersModel.setPlaced(i, false);
		};
		this._lettersModel.unselect();

        this.state = GameState.PLAYER_MOVE;
        this._boardView.setStatus( "Place your word" );

        this._boardView.setStateMood( this.state );
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

		var myPlay = new Play( {
			gameId: 			this.gameId,
			turnIndex: 			this.turnIndex,
			playerIndex: 		this.playerIndex,
			moveType: 			moveType,
			word: 				this._boardModel.getPlayedWord( this.playerIndex ),
			wordValue: 			this._boardController.getPlayedScore( this.playerIndex ),
			playRange: 			this._boardModel.getPlacedRange(),
			newPosition: 		this._boardModel.getCoordinatesForCell( this._boardController.getEndOfWordCell( this.playerIndex ) ),
			attackMultiplier: 	this._scoreModel.getAttackMultiplier()
		});

		this._lettersModel.unselect();
		this._lettersView.updateSelection();

		this._boardController.unhighlightPlaceablePositions();

        this._boardView.setStatus( "Waiting for other player" );
        this.state = GameState.REMOTE_MOVE;

        this._boardView.setStateMood( this.state );
 		this._buttonsView.enableMoveButton(   false );
 		this._buttonsView.enableAttackButton( false );
		this._buttonsView.enableResetButton(  false );
		this._lettersView.setEnabled( false );


		this._remote.executeLocalPlay( myPlay );
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
     
    this._receiveTurnList = function( turnList ) {
 		this.log.info( this.constructor.name + '._receiveTurnList(.)');
       turnList.forEach( (function( turn ) {
            this._letterTiles[ turn.turnIndex ] = turn.tiles;
        }).bind( this ));
    }
    
    this._receivePlayList = function( playList ) {
 		this.log.info( this.constructor.name + '._receivePlayList(.)');
         var _plays = this._plays;
         playList.forEach( function( play ) {
            _plays[ play.turnIndex ] = _plays[ play.turnIndex ] || [];
            _plays[ play.turnIndex ][ play.playerIndex ] = play;            
         });
         
         // have we receieved enough Plays to end this turn
         var playsForThisTurn = this._plays[ this.turnIndex ];
         if ( playsForThisTurn !== undefined ) {
            var playsForThisTurnCount = playsForThisTurn.countWhere( notNull );

            if ( playsForThisTurnCount >= this.playerCount ) {
                this.endTurn();
            }
         }
     }

    this.endTurn = function() {
		this.log.info( this.constructor.name + '.endTurn()' );

		this._boardController.resetWord();
		this._boardController.unhighlightAttackable();

        var playsForTurn = this._plays[ this.turnIndex ];

        var gameEnded = this.updateScore( playsForTurn );

        var movePlays = [];
        var attackPlays = [];
		for (var p = playsForTurn.length - 1; p >= 0; p--) {
			switch ( playsForTurn[p].moveType ) {
				case 'move':
					movePlays.push( playsForTurn[p] );
					break;
				case 'attack':
					attackPlays.push( playsForTurn[p] );
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

		for (var p = playsForTurn.length - 1; p >= 0; p--) {
			this.addPlayedItem( playsForTurn[p] );
		}

		if ( gameEnded ) {
            this.endGame();
            return true;
        } else { // next turn
            ++this.turnIndex;
            this.newTurn();
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

                if ( i === this.playerIndex ) {
                    this.state = GameState.REMOTE_WIN;
                } else {
                    this.state = GameState.PLAYER_WIN;
                }
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

		this._boardView.setStatus( 'End of Game' );
		this._boardView.setStateMood( this.state );
        
		this._lettersView.setEnabled( false );

		this._buttonsView.enableMoveButton(   false );
		this._buttonsView.enableAttackButton( false );
		this._buttonsView.enableResetButton(  false );		
	 }

    //
	// constructor code
    //
    this.state = GameState.NOT_STARTED;
    this._isBoardLoaded = false;

    this.playerIndex = null;
    // 2 dimensional array of Play objects - plays[turnIndex][playerIndex]
    this._plays = [];
    // 2 dimensional array of letters - _letterTiles[turnIndex][letterIndex]
    this._letterTiles = [];
    
	this._audio = new AudioProxy();

	this._scoreStrategy = scoreStrategy;
	this._attackRangeStrategy = attackRangeStrategy;
    this._remote = remoteProxy;

	this._lettersModel = new LettersModel();
	this._lettersView = new LettersView( this._lettersModel );
	this._lettersView.setEnabled( true );

	this._boardModel = new BoardModel();
	this._boardView = new BoardView( this._boardModel );
	this._boardController = new BoardController( this._boardModel, this._boardView );

	this._scoreModel = new ScoreModel();

	this._buttonsView = new ButtonsView();

	this._boardView.setStatus( "Waiting for remote player" );

	this._boardView.setStateMood( this.state );
	this._buttonsView.enableMoveButton(   false );
	this._buttonsView.enableAttackButton( false );
	this._buttonsView.enableResetButton(  false );
	this._buttonsView.setPlayerModel( this._scoreModel );

	// bind all the things

    // remote bindings
	this._remote.on( this._remote.Event.GAME_INFO, (function(msg) {
        this._receiveGameInfo(msg);
	}).bind(this));

	this._remote.on( this._remote.Event.PLAY_INFO, (function(msg) {
        this._receivePlayList(msg);
	}).bind(this));

	this._remote.on( this._remote.Event.TURN_INFO, (function(msg) {
        this._receiveTurnList( msg );
	}).bind(this));

    // UI bindings
	this._lettersView.onClick( (function(index, letter) {
		this.selectLetterToPlace(index, letter);
	}).bind(this) );

	this._boardModel.onBoardLoaded(( function() {
		this._boardLoaded()
	}).bind( this ));

	this._boardView.onClick( (function(cell) {
		this.placeLetterOnBoard(cell);
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

    // get ourselves a game
    this._remote.getGame();
}

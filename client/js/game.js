"use strict";

function GameController( remoteProxy, scoreStrategy, attackRangeStrategy ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.INFO );

    // Play state for this player
    this._getCurrentPlayForPlayer = function() {
        return this._plays[this.turnIndex][this._gameInfo.playerIndex];
    }

    // remote callback when we receive gameInfo from remote
    // will start the game when required
    this._receiveGameInfo = function( gameInfo ) {
		this.log.info( this.constructor.name + '._receiveGameInfo(.)' );
        if ( this.state !== GameState.NOT_STARTED ) {
            return; // ignore redundant updates
        }
        
        this._gameInfo = gameInfo;        
        // set this._gameInfo.playerIndex - index of local player
        this._gameInfo.playerList.forEach( (function( playerInList, indexInList ) {
            if ( playerInList.playerId === this._remote.playerId ) {
                this._gameInfo.playerIndex = indexInList;
            }
        }).bind(this));
        if ( this._gameInfo.playerIndex === null ) {
            throw new Error( "Received gameInfo for gameId=" + gameInfo.gameId + " which we (playerId=" + this._remote.playerId + ") are not a member" );
        }

        if ( ! this._isBoardLoaded ) {
    		this._boardModel.loadBoard(	this._gameInfo.board );
        }
        
        this._lettersModel.setLetterCount( gameInfo.letterCount );
        this._lettersView.updateLetters();
        
        this.checkForGameStart();
    }

	// called back when board has loaded
	this._boardLoaded = function() {
        this._isBoardLoaded = true;
        this.checkForGameStart();
	}
    
    // check if we are ready, then start the game
    this.checkForGameStart = function() {
		this.log.info( this.constructor.name + '.checkForGameStart(.)' );

        // if we aren't ready yet, just return
        if ( this.state !== GameState.NOT_STARTED ||
            ! this._isBoardLoaded ||
            this._gameInfo.playerCount !== this._gameInfo.playerList.length ||
            typeof this._gameInfo.playerIndex !== 'number' ||
            this._letterTiles.length < 1 
        ) {
            this.log.debug( this.constructor.name + '.checkForGameStart() - not ready yet' );
            return;
        }
		this.log.debug( this.constructor.name + '.checkForGameStart() - ready!' );

        this.state = GameState.PLAYER_MOVE;
        this.turnIndex = 0;

        this.emit( 'gameInfo', this._gameInfo );

        // add delay so that board load can be rendered before start animations
        setTimeout( (function() { 
            this._audio.newGame();

            this._boardView.setStateMood( this.state );
            this._boardView.flashPlayer( this._gameInfo.playerIndex );
            this._scoreView.flashScore( this._gameInfo.playerIndex );

            this.newTurn();
        }).bind( this ), 500 );
    }            

	this.newTurn = function() {
		this.log.info( this.constructor.name + '.newTurn(.)' );

        // create Play objects for this turn
        this._plays[this.turnIndex] = this._plays[this.turnIndex] || [];
        for ( var p = this._gameInfo.playerCount - 1; p >= 0; p-- ) {
			var play = this._plays[this.turnIndex][p];
			if ( typeof play === 'undefined' ) { // don't override preloaded (allow us to replay mulitple turns)
				if ( this.turnIndex === 0 ) { // bootstrap first turn
					play = new Play();
					play.loadFromGameInfo( p, this._gameInfo );
                    play.startPosition = this._boardModel.getCoordinatesForPlayer( play.playerIndex );
				} else { // otherwise, from previous turn
					play = this._plays[this.turnIndex - 1][p].createNextTurnPlay();            
				}
			}

            this._plays[this.turnIndex][p] = play;
            this.emit( 'play', play );
        }
        var playsForThisTurn = this._plays[this.turnIndex];

        // check for game end after we update the Play and Views
        if ( this.checkForGameEnd( playsForThisTurn ) ) {
        	return;
        }

		for ( var i = this._letterTiles[ this.turnIndex ].length - 1; i >= 0; i-- ) {
			this._lettersModel.setLetter(i, this._letterTiles[ this.turnIndex ][ i ] );
			this._lettersModel.setPlaced(i, false);
		};
		this._lettersModel.unselect();

        this.state = GameState.PLAYER_MOVE;
        this._boardView.setStatus( "Place your word" );

        this._boardView.setStateMood( this.state );
		this._buttonsView.enable( 'move',   false );
		this._buttonsView.enable( 'attack', false );
		this._buttonsView.enable( 'reset',  false );

        setTimeout( (function() { // add timed-delay so animations finish
            this._lettersView.updateLetters();
            this._lettersView.updatePlaced();
            this._lettersView.updateSelection();
            this._lettersView.setEnabled( true );
        }).bind( this ), 500 );
	}

	this.selectLetterToPlace = function(index, letter) {
		this.log.info(this.constructor.name, '.selectLetterToPlace(index=' + index + ', letter=' + letter + ')');
		this.log.debug('GameController.selectLetterToPlace  (this=' + this + ')');

		if ( this._lettersModel.isPlaced(index) ) {
			// don't select, just return
			return;
		}

        this._audio.selectTile();

		this._lettersModel.select(index);
		this._lettersView.updateSelection();
		this._boardController.highlightPlaceablePositions( this._gameInfo.playerIndex );
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
        this._audio.placeTile();
        
		this._boardModel.placeLetter( cell, this._lettersModel.getSelectedLetter() );
		this._lettersModel.setPlaced( this._lettersModel.getSelectedIndex(), true );
		this._lettersModel.unselect();
		this._lettersView.updateSelection();
		this._lettersView.updatePlaced();
		this._boardController.unhighlightPlaceablePositions();
		this._buttonsView.enable( 'move',  true );
		this._buttonsView.enable( 'reset', true );

        // if first cell is placed, hint the direction of play
        var placedCells = this._boardModel.getPlacedCells();
        if ( placedCells.length === 1 ) {
            this._boardView.flashPlaceableRow( placedCells, this._boardModel.getPlacedDirection() );
        }

        // if we can attack
		if ( this._getCurrentPlayForPlayer().startAttackMultiplier > 0 && this.isAttackInRange() ) {

			this._buttonsView.enable( 'attack', true );

			var localPlayerCoords = this._boardModel.getCoordinatesForCell( this._boardModel.getPlayerCell( this._gameInfo.playerIndex ))
			var placedRange = this._boardModel.getPlacedRange();
			var strategy = this._attackRangeStrategy;
			this._boardController.highlightAttackableWhere( function( _ignore_cell, coords ) {
				return ( strategy.isAttackInRange( localPlayerCoords, coords, placedRange ));
			});
		} else {
			this._buttonsView.enable( 'attack', false );
		}
	}

	this.isAttackInRange = function() {
		for (var p = this._gameInfo.playerCount - 1; p >= 0; p--) { // check the other players
			if ( 	p != this._gameInfo.playerIndex && // can't attack ourself
					this._attackRangeStrategy.isAttackInRange(
						this._boardModel.getCoordinatesForCell( this._boardModel.getPlayerCell( this._gameInfo.playerIndex )),
						this._boardModel.getCoordinatesForCell( this._boardModel.getPlayerCell( p )),
						this._boardModel.getPlacedRange() )) {
				return true;
			}
		}
	}

	// Whether the given word is valid
	this.validWord = function( word ) {
		return ( sowpods.binaryIndexOf( word ) >= 0 );
	}

	// user has clicked Move or Attack
	this.playWord = function( playType ) {
		this.log.info( this.constructor.name + '.playWord(' + playType + ')');
		var wordPlaced = this._boardModel.getPlayedWord( this._gameInfo.playerIndex );

		if ( ! this.validWord( wordPlaced ) ) {
            // try reverse
            wordPlaced = naiveReverse( wordPlaced );
            if ( ! this.validWord( wordPlaced ) ) {
                this._audio.invalidWord();
                this._boardView.flash('flash-error');
                return;
            }
		}

        this._audio.playWord();

		var myPlay = this._getCurrentPlayForPlayer();
		myPlay.playComplete     = true,
		myPlay.playType         = playType,
        myPlay.word             = wordPlaced,
		myPlay.wordPoints       = this._boardController.getPlayedScore( this._gameInfo.playerIndex ),
		myPlay.endWordPosition  = this._boardModel.getCoordinatesForCell( this._boardController.getEndOfWordCell( this._gameInfo.playerIndex ) ),

		this._lettersModel.unselect();
		this._lettersView.updateSelection();

		this._boardController.unhighlightPlaceablePositions();

        this._boardView.setStatus( "Waiting for other player" );
        this.state = GameState.REMOTE_MOVE;

        this._boardView.setStateMood( this.state );
 		this._buttonsView.enable( 'move',   false );
 		this._buttonsView.enable( 'attack', false );
		this._buttonsView.enable( 'reset',  false );
		this._lettersView.setEnabled( false );


		this._remote.executeLocalPlay( myPlay );
 	}

	this.resetWord = function() {
		this.log.info( this.constructor.name + '.resetWord(.)');

        this._audio.resetWord();

		this._boardController.resetWord();

		this._lettersModel.unplaceAll();
		this._lettersModel.unselect();
		this._lettersView.updatePlaced();
		this._lettersView.updateSelection();

		this._buttonsView.enable( 'move',   false );
		this._buttonsView.enable( 'attack', false );
		this._buttonsView.enable( 'reset',  false );
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
            var playsForThisTurnCount = playsForThisTurn.countWhere( (play) => {
                return notNull(play) && play.playComplete; 
            });

            if ( playsForThisTurnCount >= this._gameInfo.playerCount ) {
                this.endTurn();
            }
         }
     }

    this.endTurn = function() {
		this.log.info( this.constructor.name + '.endTurn()' );

		this._boardController.resetWord();
		this._boardController.unhighlightAttackable();

        var playsForTurn = this._plays[ this.turnIndex ];

        // execute all the scoreStrategy logic
		this._scoreStrategy.calculateScore( playsForTurn );

        // sort Plays into moves and attacks
        var movePlays = [];
        var attackPlays = [];
		for (var p = playsForTurn.length - 1; p >= 0; p--) {
			switch ( playsForTurn[p].playType ) {
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
			if ( movePlays.length > 0 ) { // move vs attack, shown after a delay
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

        playsForTurn.forEach(( play => {
			this._boardView.addPlayedItem( play );
            this.emit( 'endTurn', play );            
        } ).bind( this ));

        ++this.turnIndex;
        this.newTurn();
	}

	this.executeMove = function( play ) {
		this.log.info( this.constructor.name + '.executeMove(play=.)' );
	}

	// execute attack initiated by giver play(-er)
	this.executeAttack = function( play ) {
		this.log.info( this.constructor.name + '.executeAttack(play=.)' );
		this._boardView.flashAttackOnPlayer( 1 - play.playerIndex ); // TODO: this is hard-coded for 2-player, should be generic
	}
    
 	this.checkForGameEnd = function( plays ) {
		this.log.info( this.constructor.name + '.checkForGameEnd(.)');

        var endGame = false;
		for (var i = plays.length - 1; i >= 0; i--) {
            if ( plays[i].lost ) {
                endGame = true;              
                if ( i === this._gameInfo.playerIndex ) { // if WE lost
                    this._audio.lose();
                    this.state = GameState.REMOTE_WIN;
                } else { // must be the other guy
                    this._audio.win();
                    this.state = GameState.PLAYER_WIN;
                }
			}
		}

        if ( ! endGame ) {
            return false;
        }    

        var statusMessage = 'End of Game - ' + 
            ( this._getCurrentPlayForPlayer().lost ? 'you lost :-(' : 'you won! :-)' );
		this._boardView.setStatus( statusMessage );
		this._boardView.setStateMood( this.state );
        
		this._lettersView.setEnabled( false );

		this._buttonsView.enable( 'move',   false );
		this._buttonsView.enable( 'attack', false );
		this._buttonsView.enable( 'reset',  false );	
        
        return true;	
	 }

    //
	// constructor code
    //
    this.state = GameState.NOT_STARTED;
    this._isBoardLoaded = false;
    this.turnIndex = 0;

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
	this._boardController = new BoardController( this._boardModel, this._boardView, this );

	this._scoreView = new ScoreView( this );

	this._buttonsView = new ButtonsView( this );

	this._boardView.setStatus( "Waiting for remote player" );

	this._boardView.setStateMood( this.state );
	this._buttonsView.enable( 'move',   false );
	this._buttonsView.enable( 'attack', false );
	this._buttonsView.enable( 'reset',  false );

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

	this._buttonsView.on( 'move', (function() {
		this.playWord('move');
	}).bind(this) );

	this._buttonsView.on( 'attack', (function() {
		this.playWord('attack');
	}).bind(this) );

	this._buttonsView.on( 'reset', (function() {
		this.resetWord();
	}).bind(this) );

    // get ourselves a game
    this._remote.getGame();
}

// make the class an EventEmitter
GameController.prototype = Object.create(EventEmitter.prototype);

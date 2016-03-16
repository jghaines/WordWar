"use strict";

function BoardModel() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.loadBoard = function(url) {
		this.log.info( this.constructor.name + '.loadBoard('+url+', callback)');

		var that = this;
		this._table.load( url, '', ( function(responseText, status, jqXHR) { // fire callbacks once load is complete
            if ( status === "error" ) {
                throw new Error( "Failed to load url='" + url +"' : " + jqXHR.status + " " + jqXHR.statusText );
            } else {
                this._boardLoadedCallbacks.fire();
            }
		}).bind( this ));
	}

	this.getHeight = function() {
		return this._table.find('tr').length;
	}

	this.getWidth = function() {
		return this._table.find('tr:eq(0) td').length;
	}

	this.getBoardRange = function() {
		return new CoordRange(
			new Coordinates( 0, 0 ),
			new Coordinates( this.getHeight() - 1, this.getWidth() - 1 )
			);
	}

	// invoke callback( cell, coordinates ) - for every cell on the board
	this.foreach = function( callback ) {
		for (var row = this.getHeight() - 1; row >= 0; row--) {
			for (var col = this.getWidth() - 1; col >= 0; col--) {
				var coords = new Coordinates( row, col );
				callback( this.getCellAtCoordinates( coords ), coords );			
			};
		};
	}

	this.getCoordinatesForCell = function( cell ) {
		return new Coordinates( cell.parent().index(), cell.index() );
	}

	this.getCellAtCoordinates = function( coords ) {
		if ( coords.constructor.name != 'Coordinates') {
			throw new Error( this.constructor.name + '.getCellAtCoordinates() - expected coordinates object' );
		}

		if ( coords.row < 0 || coords.row >= this.getHeight() ||
			 coords.col < 0 || coords.col >= this.getWidth() ) {
			return null;
		}
		return $( this._table.find( 'tr:eq(' + coords.row + ') td:eq(' + coords.col + ')' )[0] );
	}

	// get 1x1 range of given cell
	this.getCellRange = function( cell ) {
		var coords = this.getCoordinatesForCell( cell );
		return new CoordRange(	new Coordinates( coords.row, coords.col ),
							new Coordinates( coords.row, coords.col ) );
	}

	this.getNextCellInDirection = function( startCell, direction ) {
		this.log.info( this.constructor.name + '.getNextCellInDirection(..)' );
		this.log.debug( this.constructor.name + '.getNextCellInDirection(startCell, direction=' + direction + ')' );

		var coords = this.getCoordinatesForCell( startCell );
		switch(direction) {
			case 'left':
				coords.col--;
				break;
			case 'right':
				coords.col++;
				break;
			case 'up':
				coords.row--;
				break;
			case 'down':
				coords.row++;
				break;
			default:
				throw this.constructor.name + '.getNextCellInDirection() - invalid direction=' + direction;
		}	      
		return this.getCellAtCoordinates( coords );
	}

	this._getAllCellsInDirection = function( startCell, direction ) {
		this.log.info( this.constructor.name + '._getAllCellsInDirection(..)' );
		this.log.debug( this.constructor.name + '._getAllCellsInDirection(startCell, direction=' + direction + ')' );

		if ( 'any' === direction ) {
			return [];
		}

		var cells = [];
		var nextCell = this.getNextCellInDirection( startCell, direction );
		while ( nextCell ) {
			cells.push( nextCell );
			nextCell = this.getNextCellInDirection( nextCell, direction );
		}
		return cells;
	}

	// TODO: this sholud be Controller logic
	this._getWordCandidateCellsInDirection = function( startCell, direction ) {
		this.log.info( this.constructor.name + '._getWordCandidateCellsInDirection(..)' );
		this.log.debug( this.constructor.name + '._getWordCandidateCellsInDirection(startCell, direction=' + direction + ')' );

		var cells = this._getAllCellsInDirection( startCell, direction );
		var lastPlacedIndex = cells.lastIndexWhere( function() { return $(this).hasClass( 'placed' ) } );
		this.log.debug( '  ' + this.constructor.name + '._getWordCandidateCellsInDirection() - cells.length (all)=' + cells.length + ', lastPlacedIndex=' + lastPlacedIndex );

		if ( lastPlacedIndex < 0 ) {
			return [];
		}

		// anything after and including the first blank (i.e. non-static) cell after the lastPlaced cell, isn't candidate
		var trailingBlankIndex =  cells.firstIndexWhere( function() { return ! $(this).hasClass( 'static' ) }, lastPlacedIndex + 1 );
		if ( trailingBlankIndex >= 0 ) {
			cells.splice( trailingBlankIndex );
		}
		this.log.debug( '  ' + this.constructor.name + '._getWordCandidateCellsInDirection() - cells.length (spliced)=' + cells.length + ', trailingBlankIndex=' + trailingBlankIndex );

		switch (direction) {
			case 'left': // fallthrough
			case 'up':
				return $( cells.reverse() );
			case 'right': // fallthrough
			case 'down':
				return $( cells );
			default:
				throw new Error( this.constructor.name + '._getWordCandidateCellsInDirection() - invalid direction: ' + direction );
		}
	}

	// TODO: this sholud be Controller logic
	this.getWordCandidateCells = function( playerIndex ) {
		this.log.info( this.constructor.name + '.getWordCandidateCells()' );

		return this._getWordCandidateCellsInDirection( this.getPlayerCell( playerIndex ), this.getPlacedDirection() );
	}

	this.getPlayerCell = function( playerIndex ) {
		var cell = this._table.find('td.player-' + playerIndex);
		if ( cell.length > 0 ) {
			return cell;
		} else {
			return null;
		}
	}

	this.setPlayerCell = function(playerIndex, coordinates) {
		this.log.info('BoardModel.setPlayerCell(playerIndex =' + playerIndex +', coordinates)');
		var cssClass = 'player-' + playerIndex;
		var prevCell = this.getPlayerCell( playerIndex );
		prevCell.html( '' ); // empty previous cell
		prevCell.removeClass( cssClass );

		var newCell = this.getCellAtCoordinates( coordinates );
		newCell.addClass( cssClass );
		newCell.html( '<img src="/images/player-' + playerIndex + '.png" />' );
	}

	this.isCellPlaceable = function(cell) {
		return cell.hasClass('placeable');
	}

	this.placeLetter = function(cell, letter) {
		cell.text(letter);
		cell.addClass('placed');
		this._placedDirection = cell.attr('ww:direction');
	}

	this.setUnplaceableAll = function() {
		this._table.find('td.placeable').each( function() {
			$(this).removeClass('placeable');
		});
	}

	this.unplaceAll = function() {
		var cells = this.getPlacedCells();
		cells.each( function() {
			$(this).removeClass('placed').text('');
		});
		this._placedDirection = 'any';
	}

	// list of cells that are placed
	this.getPlacedCells = function() {
		return this._table.find('td.placed');
	}

	this.getPlayedWord = function( playerIndex ) {
		return 	$.map( this.getWordCandidateCells( playerIndex ), function( val, i ) {
		  return $(val).text();
		}).join('');

	}

	this.getPlacedRange = function() {
		var placedCells = this.getPlacedCells();
		var minCoordinates = this.getCoordinatesForCell( placedCells.first() );
		var maxCoordinates = this.getCoordinatesForCell( placedCells.last() );

		return new CoordRange(
			new Coordinates( minCoordinates.row, minCoordinates.col ),
			new Coordinates( maxCoordinates.row, maxCoordinates.col ));
	}

	this.setAttackable = function( cell, isAttackable ) {
		$(cell).toggleClass( 'attackable', isAttackable );
	}

	this.getPlacedDirection = function() {
		return this._placedDirection;
	}

	// register callback
	this.onBoardLoaded = function( callback ) {
		this._boardLoadedCallbacks.add( callback );
	}

	this._table = $( 'table.gameboard' );
	this._boardView = null;
	this._placedDirection = 'any';

	this._boardLoadedCallbacks = $.Callbacks();

}

function BoardView( boardModel ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	/* called when board is loaded */
	this._boardLoaded = function() {
		this._fillSpecials(/*all*/);
		var that = this;
		this._table.find( 'td' ).click( function() {
			that._click( $(this) );
		} );

	}

	this._fillSpecials = function( cells ) {
		this.log.info( this.constructor.name + '.fillSpecials(.)' );
		cells = ( typeof cells !== 'undefined' ? cells : this._table.find( 'td' ) ); // default to all gameboard cells
		this.log.debug( '  ', this.constructor.name,'.fillSpecials(.) - cells.length=', cells.length );

		cells.each( function() {
			if ( $(this).hasClass( 'player-0' ) ) { // player
				var playerIndex = 0;
				$(this).html( '<img src="/images/player-' + playerIndex + '.png" />' );
			} else if ( $(this).hasClass( 'player-1' ) ) { // player
				var playerIndex = 1;
				$(this).html( '<img src="/images/player-' + playerIndex + '.png" />' );
			} else if ( $(this).hasClass( 'ai' ) ) { // ai
				$(this).html( '<img src="/images/ai.gif" />' );
			} else if ( $(this).hasClass( 'exit' ) ) { // exit
				$(this).html( '<img src="/images/exit.png" />' );
			} else if ( $(this).hasClass( 'bonus' ) ) { // bonus
				$(this).html(
					'<div class="bonus">' + 'x' + $(this).attr( 'ww_value' ) + '<br />' +
					 ( $(this).hasClass( 'letter' ) ? "<span class='bonusType'>letter</span>": '' ) +
					 ( $(this).hasClass( 'word'   ) ? "<span class='bonusType'>word</span>": '' ) +
					'</div>');
			} else if ( $(this).attr('ww_value') ) { // static
				$(this).text( $(this).attr('ww_value') );
			}
		});
	}

	this.setStatus = function( statusMessage ) {
		this._status.text( statusMessage );
	}

	this.setStateMood = function( gameState ) {
        // clear existing mood, set new
        Object.keys( GameState ).forEach( (function(key) {
            this._body.removeClass( "state_" + GameState[key].name );
        }).bind(this) );
        this._body.addClass( "state_" + gameState.name );
    }

	this.addPlayedItem = function( play ) {
		this.log.info( this.constructor.name + '.addPlayedItem(play=.)' );
        var line = 
            play.moveType.toTitleCase() + 
            ': ' + 
            play.word + ' ' + 
			( play.score > 0 ? '+' : '' ) +
			play.score;
        var mouseOver = '(' + play.wordValue + ')';

		var element = $('<li/>').text( line );
		if ( typeof styleClass !== 'undefined' ) {
			element.addClass( 'move-' + play.moveType );
            element.prop( 'title', mouseOver );
		}
        this._wordLists[play.playerIndex].append( element );
        element[0].scrollIntoView(false);
	}

    this.flashPlaceableRow = function( fromCell, direction ) {
        this._boardModel._getAllCellsInDirection( fromCell, direction ).forEach( function( cell, index ) {
            setTimeout( function() {
                flash( cell, 'flash-placeable' ); 
            }, index*10 ); // delay creates cascading strobe effect
        }); 
    }

    // flash entire board
	this.flash = function( flash_class ) {
		flash( this._table, flash_class );
	}

	this.flashPlayer = function( playerIndex ) {
		var cell = this._boardModel.getPlayerCell( playerIndex );
		flash( cell, 'flash-large-pulse' );
	}

	this.flashAttackOnPlayer = function( playerIndex ) {
		var cell = this._boardModel.getPlayerCell( playerIndex );
		flash( cell, 'flash-attack' );
	}

	this.onClick = function( callback ) {
		this.log.info( this.constructor.name + '.onClick(.)' );
		this._clickCallbacks.add( callback );
	}

	// when a letter is clicked, trigger the callbacks
	this._click = function( cell ) {
 		this._clickCallbacks.fire( cell );
	}


	this._bindDragDrop = function() {
		$_table.find('td' ).droppable( {
			drop: function( event, ui ) {
				$( this )
					.addClass( "ui-state-highlight" )
					.text('X');
				}
			});
	}

	// constructor code
	this._boardModel = boardModel;

	this._table  = $( 'table.gameboard' );
	this._status = $( '.status' );
	this._body   = $( 'body' );
	this._wordLists = [
		$( 'div.playedwords.player-0 ul' ),
		$( 'div.playedwords.player-1 ul' ),
	];

	this._clickCallbacks = $.Callbacks();

	this._boardModel.onBoardLoaded(( function() {
		this._boardLoaded()
	}).bind( this ));
}


function BoardController(boardModel, boardView) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this._boardLoaded = function() {
		this.log.info( this.constructor.name + '._boardLoaded()' );
	}

	this.addPlayedRange = function( playerIndex, range ) {
		range.foreach( ( function( coords ) {
			var cell = this._boardModel.getCellAtCoordinates( coords );
			cell.addClass( 'played-' + playerIndex );
			if ( cell.hasClass('bonus') ) {
				cell.attr( 'ww_value', 1 ); // bonus will only work on first play
			}
		}).bind( this ));
	}

	this.unhighlightPlaceablePositions = function() {
		this.log.info("BoardController.unhighlightPlaceablePositions()");
		this._boardModel.setUnplaceableAll();
	}

	this._highlightNextPlaceable = function( fromCell, direction ) {
		this.log.info( this.constructor.name + '._highlightNextPlaceable(., direction=' + direction + ')');
		var coords = this._boardModel.getCoordinatesForCell( fromCell );

		var placeableCell;
		do {
			switch(direction) {
				case 'left':
		    		coords.col--;
					break;
	    		case 'right':
		    		coords.col++;
					break;
	    		case 'up':
	    			coords.row--;
		        	break;
	    		case 'down':
	    			coords.row++;
		        	break;
		        default:
		        	throw this.constructor.name + '._highlightNextPlaceable() - invalid direction=' + direction;
		    }
			this.log.debug( this.constructor.name, '._highlightNextPlaceable() loop coords=', coords );
	    	placeableCell = this._boardModel.getCellAtCoordinates( coords );
		} while ( placeableCell && // stop when no more cells
				! placeableCell.hasClass( 'block' ) && // stop at a block
				( placeableCell.hasClass( 'placed' ) || placeableCell.hasClass( 'static' )) // iterate over placed and static
				);

		if ( placeableCell && ! placeableCell.hasClass( 'block' )) {
			placeableCell.addClass( 'placeable' );
			placeableCell.attr( 'ww:direction', direction );
		}
	}

	this.highlightPlaceablePositions = function( playerIndex ) {
		this.log.info("BoardController.highlightPlaceablePositions()");
		var placedCells =  this._boardModel.getPlacedCells();
		var playerCell =  this._boardModel.getPlayerCell( playerIndex );

		this.unhighlightPlaceablePositions();

		if ( placedCells.length == 0 ) {
			this.log.debug("  BoardController.highlightPlaceablePositions() - direction == any");
			// no placed cells - all directions
			this._highlightNextPlaceable(playerCell, 'up');
			this._highlightNextPlaceable(playerCell, 'down');
			this._highlightNextPlaceable(playerCell, 'left');
			this._highlightNextPlaceable(playerCell, 'right');
		} else {
			var direction = this._boardModel.getPlacedDirection();
			this._highlightNextPlaceable(playerCell, direction);
		}
	}

	// invoke callback( cell, coords ) for each cells, set Attackable where it returns true
	this.highlightAttackableWhere = function( callback ) {
		var board = this._boardModel;
		this._boardModel.foreach( function( cell, coords ) {
			var isAttackable = callback( cell, coords );
			board.setAttackable( cell, isAttackable );
		});
	}

	this.unhighlightAttackable = function() {
		this.highlightAttackableWhere( function( _ignore_cell, _ignore_coords ) {
			return ( false );			
		});
	}
    
	this.resetWord = function() {
		var cells = this._boardModel.getPlacedCells();
		this._boardModel.unplaceAll();
		this._boardView._fillSpecials( cells );
		this.unhighlightPlaceablePositions();
		this.unhighlightAttackable();
	}

	this.getEndOfWordCell = function( playerIndex ) {
		switch ( this._boardModel._placedDirection ) {
			case 'right': // fall through
			case 'down':
				return this._boardModel.getWordCandidateCells( playerIndex ).last()[0]; // not sure why [0] is required
			case 'left': // fall through
			case 'up':
				return this._boardModel.getWordCandidateCells( playerIndex ).first()[0];
		}
		return null;
	}

	this.getPlayedScore = function( playerIndex ) {
		var score = 0;
		var wordBonus = 1;
		this._boardModel.getWordCandidateCells( playerIndex ).each( function() {
			var letterBonus = 1;
			var letterScore = scoreForLetter( $( this ).text() );
			if ( $(this).hasClass('bonus') ) {
				if ( $(this).hasClass('letter') ) {
					letterBonus *= $(this).attr('ww_value');
				} else if ( $(this).hasClass('word') ) {
					wordBonus *= $(this).attr('ww_value');
				} 
			}
			score += letterBonus * letterScore;
		} );
		return wordBonus * score;
	}

	this.setPlayerCell = function(playerIndex, coordinates) {
		var prevCell = this._boardModel.getPlayerCell( playerIndex );
		this._boardModel.setPlayerCell( playerIndex, coordinates );
		this._boardView._fillSpecials( prevCell );
	}


	// constructor code
	this._boardModel = boardModel;
	this._boardView = boardView;

	this._boardModel.onBoardLoaded(( function() { 
		this._boardLoaded();
	}).bind( this ));
}

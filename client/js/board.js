
"use strict";

function BoardModel() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.loadBoard = function(url) {
		this.log.info( this.constructor.name + '.loadBoard('+url+', callback)');

		var that = this;
		this._table.load( url, '', ( function() { // fire callbacks once load is complete
			this._boardLoadedCallbacks.fire();
		}).bind( this ));
	}

 	this.getHeight = function() {
 		return this._table.find('tr').length;
 	}

 	this.getWidth = function() {
 		return this._table.find('tr:eq(0) td').length;
 	}

	this.getCoordinatesForCell = function( cell ) {
		return { row: cell.parent().index(), col: cell.index() };
	}

	this.getCellAtCoordinates = function( coords ) {
		if ( ! coords.hasOwnProperty('row') || ! coords.hasOwnProperty( 'col' ) ) {
			throw new Error( this.constructor.name + '.getCellAtCoordinates() - expected coords object' );
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
		return {
			min: { row: coords.row, col: coords.col },
			max: { row: coords.row, col: coords.col }
		};
	}

	// return the distance between cellA and cellB
	this.getCellDistance = function( cellA, cellB ) {
		this.log.info( this.constructor.name + '.getCellDistance(..)' );
		var coordsA = this.getCoordinatesForCell( cellA );
		var coordsB = this.getCoordinatesForCell( cellB );
		this.log.debug( '  ', this.constructor.name, '.getCellDistance(..) coordsA =', coordsA, 'coordsB=', coordsB );
		return	Math.sqrt(
					Math.pow( coordsA.row - coordsB.row, 2 ) + 
					Math.pow( coordsA.col - coordsB.col, 2 ) );
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
				return cells.reverse();
			case 'right': // fallthrough
			case 'down':
				return cells;
			default:
				throw new Error( this.constructor.name + '._getWordCandidateCellsInDirection() - invalid direction: ' + direction );
		}
	}

	// TODO: this sholud be Controller logic
	this.getWordCandidateCells = function() {
		this.log.info( this.constructor.name + '.getWordCandidateCells()' );

		return this._getWordCandidateCellsInDirection( this.getPlayerCell( 'local' ), this.getPlacedDirection() );
	}


 	this.rotatePosition = function( position ) {
 		return {
 			row: ( this.getHeight() - position.row - 1 ),
 			col: ( this.getWidth()  - position.col - 1 )
 		};
 	}

 	this.rotateRange = function( range ) {
 		return { min: this.rotatePosition( range.max ), max: this.rotatePosition( range.min )  };
 	}

	this.getPlayerCell = function(who) {
		return this._table.find('td.player-' + who);
	}

	this.setPlayerCell = function(who, coordinates) {
		this.log.info('BoardModel.setPlayerCell(who =' + who +', coordinates)');
		var cssClass = 'player-' + who;
		this._table.find('td.' + cssClass).removeClass(cssClass); // remove existing
		this._table.find('tr:eq(' + coordinates.row + ') td:eq(' + coordinates.col + ')').addClass(cssClass);
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

	this.getPlacedWord = function() {
		return 	$.map( this.getWordCandidateCells(), function( val, i ) {
		  return $(val).text();
		}).join('');

	}

	this.getPlacedRange = function() {
		var placedCells = this.getPlacedCells();
		var minCoordinates = this.getCoordinatesForCell( placedCells.first() );
		var maxCoordinates = this.getCoordinatesForCell( placedCells.last() );

		return {
			min: { row: minCoordinates.row, col: minCoordinates.col },
			max: { row: maxCoordinates.row, col: maxCoordinates.col }
		};
	}

	this.getEndOfWordCell = function() {
		switch(this._placedDirection) {
			case 'right': // fall through
			case 'down':
	    		return this.getPlacedCells().last();
			case 'left': // fall through
			case 'up':
	    		return this.getPlacedCells().first();
		}
		return null;
	}

	this.getPlacedDirection = function() {
		return this._placedDirection;
	}

	// TODO: (Game)Contorller logic
	this.getPlacedScore = function() {
		var score = 0;
		var wordBonus = 1;
		this.getPlacedCells().each( function() {
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

	this.addPlayedRange = function(who, range) {
		this.log.info('BoardModel.addPlayedRange(who=' + who + ', range=', range, ')');

		for( var row = range.min.row; row <= range.max.row ; ++row ) {
			for( var col = range.min.col; col <= range.max.col ; ++col ) {
				this._table.find('tr:eq(' + row + ') td:eq(' + col + ')').addClass('played-' + who);
			}			
		}
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

function BoardView(boardModel) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	/* called when board is loaded */
	this._boardLoaded = function() {
		this._fillSpecials(/*all*/);
	}

	this._fillSpecials = function(cells) {
		this.log.info('BoardView.fillSpecials(.)');
		cells = ( typeof cells !== 'undefined' ? cells : this._table.find( 'td' ) ); // default to all gameboard cells

		cells.each( function() {
			if ( $(this).hasClass( 'bonus' ) ) {
				$(this).html(
					'x' + $(this).attr( 'ww_value' ) + '<br />' +
					 ( $(this).hasClass( 'letter' ) ? "<span class='bonusType'>letter</span>": '' ) +
					 ( $(this).hasClass( 'word' ) ? "<span class='bonusType'>word</span>": '' )
					);
			} else if ( $(this).attr('ww_value') ) {
				$(this).text( $(this).attr('ww_value') );
			}
		});
	}

	this.click = function(callback) {
		this.log.info('BoardView.click(. )');
		this._table.find('td').click( function() {
			callback($(this));
		} );
	}

	this.setStatus = function ( statusMessage ) {
		this._status.text( statusMessage );
	}

	this.addPlayedWord = function ( who, wordText ) {
		this._wordLists[who].append( $('<li/>').text(wordText) );
	}


	this.flash = function(flash_class) {
		flash(this._table, flash_class);
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
	this._boardModel.onBoardLoaded( (function() {
		this._boardLoaded()
	}).bind( this ));

	this._table = $( 'table.gameboard' );
	this._status = $( '.status' );
	this._wordLists = {
		'local': 	$( 'div.playedwords.local ul' ),
		'remote': 	$( 'div.playedwords.remote ul' ),
	};
}


function BoardController(boardModel, boardView) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.unhighlightPlaceablePositions = function() {
		this.log.info("BoardController.unhighlightPlaceablePositions()");
		this._boardModel.setUnplaceableAll();
	}

	this._highlightNextPlaceable = function(fromCell, direction) {
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
			this.log.debug( this.constructor.name, '._highlightNextPlaceable()loop coords=', coords );
	    	placeableCell = this._boardModel.getCellAtCoordinates( coords );
		} while ( placeableCell && ( placeableCell.hasClass( 'placed' ) || placeableCell.hasClass( 'static' )));

		if ( placeableCell ) {
			placeableCell.addClass( 'placeable' );
			placeableCell.attr( 'ww:direction', direction );
		}
	}

	this.highlightPlaceablePositions = function() {
		this.log.info("BoardController.highlightPlaceablePositions()");
		var placedCells =  this._boardModel.getPlacedCells();
		var playerCell =  this._boardModel.getPlayerCell('local');

		this.unhighlightPlaceablePositions();

		if ( placedCells.length == 0 ) {
			this.log.debug("  BoardController.highlightPlaceablePositions() - direction == any");
			// no placed cells - all directions
			this._highlightNextPlaceable(playerCell, 'up');
			this._highlightNextPlaceable(playerCell, 'down');
			this._highlightNextPlaceable(playerCell, 'left');
			this._highlightNextPlaceable(playerCell, 'right');
		} else {
			var direction = $(placedCells).first().attr('ww:direction');
			this._highlightNextPlaceable(playerCell, direction);
		}
	}

	this.validPlacement = function() { 
		var cells = this._boardModel.getWordCandidateCells();

		if ( cells.length <= 0 ) {
			return false;
		}

		for ( var i = cells.length - 1; i >= 0 ; --i ) {
			if ( '' == cells[i].text() ) { // blank cell
				return false;
			}
		}
		return true;
	}

	this.removePlaced = function() {
		var cells = this._boardModel.getPlacedCells();
		this._boardModel.unplaceAll();
		this._boardView._fillSpecials( cells );
	}


	this._boardModel = boardModel;
	this._boardView = boardView;
}

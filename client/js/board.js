
"use strict";

function BoardModel() {

	this.loadBoard = function(url, callback) {
		this._boardView.loadBoard(url, callback);
		this._boardView._table
	}

	this.getPlayerCell = function() {
		return this._boardView._table.find('td.player-local');
	}

	this.setPlayerCell = function(who, coordinates) {
		log.info('BoardModel.setPlayerCell(who =' + who +', coordinates)');
		var cssClass = 'player-' + who;
		this._boardView._table.find('td.' + cssClass).removeClass(cssClass); // remove existing
		this._boardView._table.find('tr:eq(' + coordinates.row + ') td:eq(' + coordinates.col + ')').addClass( cssClass);
	}

	this.isCellPlaceable = function(cell) {
		return cell.hasClass('placeable');
	}

	this.placeLetter = function(cell, letter) {
		cell.text(letter);
		cell.addClass('placed');
		this._placedDirection = cell.attr('ww:direction');
	}

	this.unplaceAll = function() {
		this.getPlacedCells().each( function() {
			$(this).removeClass('placed');
		});
	}

	// list of cells that are placed
	this.getPlacedCells = function() {
		return this._boardView._table.find('td.placed');
	}

	this.getPlacedWord = function() {
		return 	$.map( this.getPlacedCells(), function( val, i ) {
		  return $(val).text();
		}).join('');

	}

	this.getPlacedRange = function() {
		var placedCells = this.getPlacedCells();
		var minCoordinates = this.getCellCoordinates( placedCells.first() );
		var maxCoordinates = this.getCellCoordinates( placedCells.last() );

		return {
			minRow: minCoordinates.row, minCol: minCoordinates.col,
			maxRow: maxCoordinates.row, maxCol: maxCoordinates.col
		};
	}

	this.getCellCoordinates = function( cell ) {
		return { row: cell.parent().index(), col: cell.index() };
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

	this.getPlacedScore = function() {
		// TODO
		return 10;
	}

	this.setPlayedCells = function(placedCells, who) {
		placedCells.each( function() {
			$(this).addClass( 'played-' + who )
		});
	}


	this._boardView = null;
	this._placedDirection = 'any';
}

function BoardView(boardModel) {

	this.fillSpecials = function(cells) {
		cells = ( typeof cells !== 'undefined' ? cells : this._table.find( 'td' ) ); // default to all cells
		log.info('BoardView.fillSpecials()');

		cells.filter( function() {
			return $(this).attr('ww_value'); }).each( function() {
				$(this).text( $(this).attr('ww_value') );
			});

	}

	this.loadBoard = function(url, callback) {
		log.info('BoardView.loadBoard('+url+')');

		var that = this;
		this._table.load( url, '', function() { // callback - after the board is loaded
			that.fillSpecials();
			callback();
		});
	}

	this.click = function(callback) {
		log.info('BoardView.click(. )');
		this._table.find('td').click( function() {
			callback($(this));
		} );
	}

	this.flash = function(flash_class) {
		flash(this._table, flash_class);
	}

	// constructor code
	this._boardModel = boardModel;
	this._boardModel._boardView = this;

	this._table = $('table.gameboard');
}


function BoardController(boardModel, boardView) {

	this.unhighlightPlaceablePositions = function() {
		log.info("BoardController.unhighlightPlaceablePositions()");
		this._boardView._table.find('td').removeClass( 'placeable' );
	}

	this.highlightPlaceablePositions = function() {
		log.info("BoardController.highlightPlaceablePositions()");
		var placedCells =  this._boardView._table.find('td.placed');
		var playerCell =  this._boardModel.getPlayerCell();
		var playerColumnIndex = playerCell.index();
		var playerRowIndex = playerCell.parent().index();

		this.unhighlightPlaceablePositions();

		if ( placedCells.length == 0 ) {
			log.info("highlightPlaceablePositions() - direction == any");
			// no placed cells - just highlight around player
			playerCell.prev().addClass( 'placeable' ).attr( 'ww:direction', 'left' );
			playerCell.next().addClass( 'placeable' ).attr( 'ww:direction', 'right' );
			playerCell.parent().prev().children().eq(playerColumnIndex).addClass( 'placeable' ).attr( 'ww:direction', 'up' );
			playerCell.parent().next().children().eq(playerColumnIndex).addClass( 'placeable' ).attr( 'ww:direction', 'down' );
		} else {
			var direction = $(placedCells).first().attr('ww:direction');
			log.info("highlightPlaceablePositions() - direction == " + direction);
			var validPositions;
			switch(direction) {
	    		case 'left':
	    			validPositions = playerCell.siblings('td:lt('+playerColumnIndex+'):not(.placed)').last();
		        break;
	    		case 'right':
	    			validPositions = playerCell.siblings('td:gt('+playerColumnIndex+'):not(.placed)').first();
		        break;
	    		case 'up':
	    			validPositions = playerCell.parent().siblings('tr:lt('+playerRowIndex+')').find('td:eq('+playerColumnIndex+'):not(.placed)').last();
		        break;
	    		case 'down':
	    			validPositions = playerCell.parent().siblings('tr:gt('+playerRowIndex+')').find('td:eq('+playerColumnIndex+'):not(.placed)').first();
		        break;
			}
			validPositions.addClass( 'placeable' );
			validPositions.attr( 'ww:direction', direction );

		}
	}


	this._boardModel = boardModel;
	this._boardView = boardView;
}

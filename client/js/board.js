
"use strict";

function BoardModel() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.loadBoard = function(url, callback) {
		this._boardView.loadBoard(url, callback);
		this._boardView._table
	}

	this.getPlayerCell = function(who) {
		return this._boardView._table.find('td.player-' + who);
	}

	this.setPlayerCell = function(who, coordinates) {
		this.log.info('BoardModel.setPlayerCell(who =' + who +', coordinates)');
		var cssClass = 'player-' + who;
		this._boardView._table.find('td.' + cssClass).removeClass(cssClass); // remove existing
		this._boardView._table.find('tr:eq(' + coordinates.row + ') td:eq(' + coordinates.col + ')').addClass(cssClass);
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
			min: { row: minCoordinates.row, col: minCoordinates.col },
			max: { row: maxCoordinates.row, col: maxCoordinates.col }
		};
	}

	this.getCellCoordinates = function( cell ) {
		return { row: cell.parent().index(), col: cell.index() };
	}

	// get 1x1 range of given cell
	this.getCellRange = function( cell ) {
		var coords = this.getCellCoordinates( cell );
		return {
			min: { row: coords.row, col: coords.col },
			max: { row: coords.row, col: coords.col }
		};
	}

 	this.getHeight = function() {
 		return this._boardView._table.find('tr').length;
 	}

 	this.getWidth = function() {
 		return this._boardView._table.find('tr:eq(0) td').length;
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

	// this doesn't work fully - http://stackoverflow.com/questions/34757734/getting-a-range-of-table-cells-with-jquery-selectors
	/*
	this._getSelectorForRange = function(range) {
		return  'tr' + ':lt(' + (range.max.row + 1) + ')' + ( range.min.row > 0 ? ':gt(' + (range.min.row - 1) + ')' : '' ) + ' ' +
				'td' + ':lt(' + (range.max.col + 1) + ')' + ( range.min.col > 0 ? ':gt(' + (range.min.col - 1) + ')' : '' );
	}
	*/	

	this.addPlayedRange = function(who, range) {
		this.log.info('BoardModel.addPlayedRange(who=' + who + ', range=', range, ')');

		for( var row = range.min.row; row <= range.max.row ; ++row ) {
			for( var col = range.min.col; col <= range.max.col ; ++col ) {
				this._boardView._table.find('tr:eq(' + row + ') td:eq(' + col + ')').addClass('played-' + who);
			}			
		}
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
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.fillSpecials = function(cells) {
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

	this.loadBoard = function(url, callback) {
		this.log.info('BoardView.loadBoard('+url+')');

		var that = this;
		this._table.load( url, '', function() { // callback - after the board is loaded
			that.fillSpecials();
			callback();
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
	this._boardModel._boardView = this;

	this._table = $('table.gameboard');
	this._status = $('.status');
	this._wordLists = {
		'local': 	$('div.playedwords.local ul'),
		'remote': 	$('div.playedwords.remote ul'),
	};
}


function BoardController(boardModel, boardView) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.unhighlightPlaceablePositions = function() {
		this.log.info("BoardController.unhighlightPlaceablePositions()");
		this._boardView._table.find('td').removeClass( 'placeable' );
	}

	this.highlightPlaceablePositions = function() {
		this.log.info("BoardController.highlightPlaceablePositions()");
		var placedCells =  this._boardView._table.find('td.placed');
		var playerCell =  this._boardModel.getPlayerCell('local');
		var playerColumnIndex = playerCell.index();
		var playerRowIndex = playerCell.parent().index();

		this.unhighlightPlaceablePositions();

		if ( placedCells.length == 0 ) {
			this.log.debug("  BoardController.highlightPlaceablePositions() - direction == any");
			// no placed cells - just highlight around player
			playerCell.prev().addClass( 'placeable' ).attr( 'ww:direction', 'left' );
			playerCell.next().addClass( 'placeable' ).attr( 'ww:direction', 'right' );
			playerCell.parent().prev().children().eq(playerColumnIndex).addClass( 'placeable' ).attr( 'ww:direction', 'up' );
			playerCell.parent().next().children().eq(playerColumnIndex).addClass( 'placeable' ).attr( 'ww:direction', 'down' );
		} else {
			var direction = $(placedCells).first().attr('ww:direction');
			this.log.debug("  BoardController.highlightPlaceablePositions() - direction == " + direction);
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

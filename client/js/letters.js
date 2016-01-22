"use strict";

function LettersModel() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.getLetterCount = function() {
		return this._letterCount;
	}

	this.setLetterCount = function( letterCount ) {
		this._letterCount = letterCount;
		this._letters =  Array(this._letterCount);
		this._isPlaced = Array.from(Array(this._letterCount)).map(() => false);
	}

	this.getLetter = function(index) {
		return this._letters[index];
	}

	this.setLetter = function(index, value) {
		this._letters[index] = value;
	}

	this.isPlaced = function(index) {
		return this._isPlaced[index];
	}

	this.setPlaced = function(index, value) {
		this._isPlaced[index] = value;
	}

	this.unplaceAll = function() {
		for ( var i = this.getLetterCount() - 1; i >= 0; --i ) {
			this.setPlaced( i, false );
		}
	}

	this.select = function(index) {
		this.log.info('LettersModel.select('+index+')');
		this._selectedIndex = index;
	}

	this.unselect = function() {
		this._selectedIndex = null;
	}

	this.getSelectedIndex = function() {
		return this._selectedIndex;
	}

	this.getSelectedLetter = function() {
		return this._letters[this._selectedIndex];
	}


	// constructor
	this._letterCount = 0
	this._letters = [];
	this._isPlaced = [];
	this._selectedIndex = null;

}


function LettersView(lettersModel) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.updateLetters = function() {
		this.log.info('LettersView.updateLetters()');

		// update letter count if mismatch
		if ( this._lettersModel.getLetterCount() != this._lettersTable.find('td').length ) {
			var that = this;
			this._lettersTable.find('tbody tr').remove();
			var tr = $('<tr />');
			this._lettersTable.find('tbody').append(tr);
			for ( var i = this._lettersModel.getLetterCount(); i > 0; --i ) {
				var td = $( '<td />' ).click( function(callback) {
					var index = $(this).index();
					var letter = $(this).text();
					that._click(index, letter);
				} );
				tr.append(td);
			}
		}

		this._lettersTable.find('td').each( (function(index, value) {
			this.log.debug('  LettersView.updateLetters()callback(index='+index+',value='+value+')');
			this.log.debug('    LettersView.updateLetters()callback() this=' + this._lettersModel.getLetter(index) );

			$(value).text( index );
			$(value).text( this._lettersModel.getLetter(index) );
		}).bind(this) );
	}

	this.updateSelection = function() {
		this.log.info('LettersView.updateSelection()');
		this._lettersTable.find('td.selected').removeClass( 'selected' );
		var index = this._lettersModel.getSelectedIndex();
		this._lettersTable.find('td:eq(' + index + ')').addClass( 'selected' );
	}

	this.updatePlaced = function() {
		this.log.info('LettersView.updatePlaced()');
		this._lettersTable.find('td').each( (function(index, value) {
			$(value).toggleClass( 'placed', this._lettersModel.isPlaced(index) );
		}).bind(this) );
	}

	// when a letter is clicked, trigger the callbacks
	this._click = function( index, letter ) {
 		this._clickCallbacks.fire( index, letter );
	}

	// register click callback handler
	this.onClick = function( callback ) {
		this.log.info('LettersView.onClick(.)');
 		this._clickCallbacks.add( callback );
	}

	this.flash = function(flash_class) {
		flash(this._lettersTable, flash_class);
	}

	this._bindDragDrop = function() {
		$_lettersTable.find('td').draggable({ revert: "invalid", snap: "table.gameboard td" })
	}

	// constructor code
	this._lettersModel = lettersModel;
	this._lettersTable = $('table.letters');
	this._clickCallbacks = $.Callbacks();
}

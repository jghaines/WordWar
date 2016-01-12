"use strict";

function LettersModel() {

	this.letterCount = function() {
		return this._LETTER_COUNT;
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

	this.select = function(index) {
		log.info('LettersModel.select('+index+')');
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
	this._LETTER_COUNT = 10
	this._letters = Array(this._LETTER_COUNT);
	this._isPlaced = Array.from(Array(this._LETTER_COUNT)).map(() => false);
	this._selectedIndex = null;

}


function LettersView(lettersModel) {

	this.updateLetters = function() {
		log.info('LettersView.updateLetters()');
		var that = this;
		this._lettersTable.find('td').each( (function(index, value) {
			log.debug('  LettersView.updateLetters()callback(index='+index+',value='+value+')');
			log.debug('    LettersView.updateLetters()callback() this=' + this._lettersModel.getLetter(index) );

			$(value).text( index );
			$(value).text( this._lettersModel.getLetter(index) );
		}).bind(this) );
	}

	this.updateSelection = function() {
		log.info('LettersView.updateSelection()');
		this._lettersTable.find('td.selected').removeClass( 'selected' );
		var index = this._lettersModel.getSelectedIndex();
		this._lettersTable.find('td:eq(' + index + ')').addClass( 'selected' );
	}

	this.updatePlaced = function() {
		log.info('LettersView.updatePlaced()');
		this._lettersTable.find('td').each( (function(index, value) {
			$(value).toggleClass( 'placed', this._lettersModel.isPlaced(index) );
		}).bind(this) );
	}

	// register click callback handler
	this.click = function(callback) {
		log.info('LettersView.click(.)');
		this._lettersTable.find('td').click( function() {
			var index = $(this).index();
			var letter = $(this).text();
			callback(index, letter);
		} );
	}

	this.flash = function(flash_class) {
		flash(this._lettersTable, flash_class);
	}


	// constructor code
	this._lettersModel = lettersModel;
	this._lettersTable = $('table.letters');
}

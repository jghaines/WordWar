"use strict";

function LettersController(view) {
	this._view = view;

	this.clearSelection = function() {
		log.info('LettersController.clearSelection');
		this._view.clearSelection();
	}
}

function LettersView(lettersTable) {
	this._lettersTable = lettersTable;

	this.clearSelection = function() {
		log.info('LettersView.clearSelection');
		this._lettersTable.find('td.selected').each(function() {
			$(this).removeClass( 'selected' );
		});
	}
}

'use strict';

function ButtonsView() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.enableMoveButton = function(isEnabled) {
		this.log.info( this.constructor.name + '.enablemoveButton(' + isEnabled + ')' );
		this._moveButton.prop('disabled', ! isEnabled );
	}

	this.enableAttackButton = function(isEnabled) {
		this.log.info( this.constructor.name + '.enableAttackButton(' + isEnabled + ')' );
		this._attackButton.prop('disabled', ! isEnabled );
	}

	this.enableResetButton = function(isEnabled) {
		this.log.info( this.constructor.name + '.enableResetButton(' + isEnabled + ')' );
		this._resetButton.prop('disabled', ! isEnabled );
	}

	this.setPlayerModel = function( playerModel ) {
		this._playerModel = playerModel;
		this._playerModel.onUpdate( (function() {
			this._updateData();
		}).bind( this ));
		this._updateData(); // get initial data
	}

	// called-back when player model is updated
	this._updateData = function() {
		this._attackButton.text( 'Attack (x' + this._playerModel.getAttackMultiplier() + ')' );
	}

	// register callbacks
	this.onMoveClicked = function( callback ) {
		this.log.info( this.constructor.name + '.onmoveClicked(callback)' );
		this._onMoveClickedCallbacks.add( callback );
	}

	this.onAttackClicked = function( callback ) {
		this.log.info( this.constructor.name + '.onmoveClicked(callback)' );
		this._onAttackClickedCallbacks.add( callback );
	}

	this.onResetClicked = function( callback ) {
		this.log.info( this.constructor.name + '.onResetClicked(callback)' );
		this._onResetClickedCallbacks.add( callback );
	}

	// fire callbacks 
	this._moveClicked = function() {
		this.log.info( this.constructor.name + '._moveClicked()' );
		this._onMoveClickedCallbacks.fire();
	}

	this._attackClicked = function() {
		this.log.info( this.constructor.name + '._attackClicked()' );
		this._onAttackClickedCallbacks.fire();
	}

	this._resetClicked = function() {
		this.log.info( this.constructor.name + '._resetClicked()' );
		this._onResetClickedCallbacks.fire();
	}


	this._moveButton   = $( 'button#move'   );
	this._attackButton = $( 'button#attack' );
	this._resetButton  = $( 'button#reset'  );

	this._onMoveClickedCallbacks   = $.Callbacks();
	this._onAttackClickedCallbacks = $.Callbacks();
	this._onResetClickedCallbacks  = $.Callbacks();

	// register private callbacks
	this._moveButton.click( ( function(){
		this._moveClicked();
	}).bind( this ) );
	this._attackButton.click( ( function(){
		this._attackClicked();
	}).bind( this ) );
	this._resetButton.click( ( function(){
		this._resetClicked();
	}).bind( this ) );

}

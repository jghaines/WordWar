function ButtonsView() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	this.enablePlayButton = function(isEnabled) {
		this.log.info( this.constructor.name + '.enablePlayButton(' + isEnabled + ')' );
		this._playButton.prop('disabled', ! isEnabled );
	}

	// register callbacks
	this.onPlayClicked = function( callback ) {
		this.log.info( this.constructor.name + '.onPlayClicked(callback)' );
		this._onPlayClickedCallbacks.add( callback );
	}

	this.onResetClicked = function( callback ) {
		this.log.info( this.constructor.name + '.onResetClicked(callback)' );
		this._onResetClickedCallbacks.add( callback );
	}

	// fire callbacks 
	this._playClicked = function() {
		this.log.info( this.constructor.name + '._playClicked()' );
		this._onPlayClickedCallbacks.fire();
	}

	this._resetClicked = function() {
		this.log.info( this.constructor.name + '._resetClicked()' );
		this._onResetClickedCallbacks.fire();
	}


	this._playButton  = $("button#move");
	this._resetButton = $("button#reset");

	this._onPlayClickedCallbacks  = $.Callbacks();
	this._onResetClickedCallbacks = $.Callbacks();

	// register private callbacks
	this._playButton.click( ( function(){
		this._playClicked();
	}).bind( this ) );
	this._resetButton.click( ( function(){
		this._resetClicked();
	}).bind( this ) );

}

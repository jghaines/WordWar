function ButtonsView() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	this.enablePlayButton = function(isEnabled) {
		this._playButton.prop('disabled', ! isEnabled );
	}

	this.clickPlay = function(callback) {
		this._playButton.click( function(){
			callback();
		});
	}

	this._playButton = $("button.play");
}

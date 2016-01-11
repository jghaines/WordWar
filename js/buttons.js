function ButtonsView() {

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

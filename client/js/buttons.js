'use strict';

function ButtonsView() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

    // en/dis-able button
	this.enable = function( buttonName, isEnabled ) {
		this.log.info( this.constructor.name + '.enable(' + buttonName + ', ' + isEnabled + ')' );
        var button = this._buttons[ buttonName ].ui;
		button.prop('disabled', ! isEnabled );
	}

    // TODO: move to controller logic
	this.setPlayerModel = function( playerModel ) {
		this._playerModel = playerModel;
		this._playerModel.onUpdate( (function() {
			this._updateData();
		}).bind( this ));
		this._updateData(); // get initial data
	};

	// called-back when player model is updated
    // TODO: move to controller logic
	this._updateData = function() {
		var attackButton = this._buttons.attack.ui;
        attackButton.text( 'Attack (x' + this._playerModel.getAttackMultiplier() + ')' );
	};

  	// JQuery click callbacks
    // emit event 
    this._click = function( button ) {
        this.emit( button.name );
    };

    // our buttons
    this._buttons = {
	    move    : { name: 'move',   ui: $( 'button#move'   ) },
	    attack  : { name: 'attack', ui: $( 'button#attack' ) },
	    reset   : { name: 'reset',  ui: $( 'button#reset'  ) },
    };


	// register private callbacks
    Object.keys(this._buttons).forEach( (function( buttonKey ) {
        var button = this._buttons[buttonKey];   
        button.ui.click( button, (function( eventObject ) {
            this._click( eventObject.data );
        }).bind( this ));
    }).bind( this ));

}

// make the class an EventEmitter
ButtonsView.prototype = Object.create(EventEmitter.prototype);

'use strict';

function ButtonsView() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

    // en/dis-able button
	this.enable = function( buttonName, isEnabled ) {
		this.log.info( this.constructor.name + '.enable(' + buttonName + ', ' + isEnabled + ')' );
        var button = this._buttons[ buttonName ].ui;
        
        // if we are changing disabled -> enabled, flash button
        if ( button.prop( 'disabled' ) && isEnabled ) {
            flash( button, 'flash-button-enable' );
        }

		button.prop( 'disabled', ! isEnabled );
	}

	this.setPlay = function( play ) {
		var attackButton = this._buttons.attack.ui;
        attackButton.text( 'Attack (x' + play.attackMultiplier + ')' );
	};

  	// JQuery click callbacks
    // emit event for button 
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

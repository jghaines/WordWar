/* global log */
/* global jQuery */
'use strict';


function RemoteProxy( socket, restBaseUrl ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );
    this.swaggerUrl = '/js/swagger.json';

    // enum for remote source
    this.source = {
        WEBSOCKET   : { id:1, name:"WEBSOCKET" },
        API         : { id:2, name:"API" }
    };
    
    // enum for EventEmitter types
    this.Event = {
        GAME_INFO : 'game_info',
        PLAY_INFO : 'play_info',
        TURN_INFO : 'turn_info',
    };
    
	//
	// server message receieve event handlers, fire callbacks
	//
    this._receiveRemoteData = function( source, data, textStatus, jqXHR ) {
        this.log.info( this.constructor.name + '._receiveRemoteData()' );
        this.log.debug( this.constructor.name, "_receiveRemoteData( source=", source.name, " data=", data, ", textStatus=" + textStatus + ", jqXHR=" + jqXHR + " )" );

		if ( textStatus && textStatus !== "success" ) {
			throw new Error( "HTTP call error" + data );
		}

        if ( data.errorMessage ) { // API Gateway-Lambda error
            throw new Error( data.errorMessage );
        }
        
        this._gameInfoReceived( data );

        if ( data.hasOwnProperty( 'turnInfo' )) {
            this._turnInfoReceived( data.turnInfo );
        }
        if ( data.hasOwnProperty( 'playList' )) {
            this._playsReceived( data.playList );
        }
        
        // postback to notification websocket if the data didn't already come from there 
        if ( source != this.source.WEBSOCKET ) {
            this._socket.emit('gameEvent', data);
        }
    }

    // we have received game info from remote, send it on
    this._gameInfoReceived = function( data ) {
        this.log.info( this.constructor.name + '._gameInfoReceived()' );

        if ( this.gameId !== data.gameId ) {
            this.gameId = data.gameId;
            this._subscribeGameNotifications();
        }

        // don't send the turn and play data with this callback
        var gameInfo = JSON.parse(JSON.stringify(data)); // ugh - Javascript object copy - http://stackoverflow.com/a/18359187/358224
        delete gameInfo.turnInfo;
        delete gameInfo.plays;
		this.emit( this.Event.GAME_INFO, gameInfo );
    }

    // we have received Play info from remote, parse and send on
    this._playsReceived = function( playList ) {
        this.log.info( this.constructor.name + '._playsReceived()' );

        var playInfo = [];
        playList.forEach( function( play ) {
            playInfo.push( new Play( play ));
        });
		this.emit( this.Event.PLAY_INFO, playInfo );
    }
    
    // we have received turn info from remote, send it on
    this._turnInfoReceived = function( turnInfoList ) {
        this.log.info( this.constructor.name + '._turnInfoReceived()' );
		this.emit( this.Event.TURN_INFO, turnInfoList );
    }
    
    this._subscribeGameNotifications = function() {
        this.log.info( this.constructor.name + '._subscribeGameNotifications()' );
		// let the server know who we are
        var subscriptionData = { 
            gameId : this.gameId,
            playerId : this.playerId
        }
        if ( subscriptionData.gameId && subscriptionData.playerId ) {
            this._socket.emit( 'subscribe', subscriptionData );            
        }
    }


	this._reconnect = function( msg ) {
		this.log.info( this.constructor.name + '._reconnect(.)');

        this._subscribeGameNotifications();
	}

	//
	// send local event to server
	//
	this.executeLocalPlay = function( localPlay ) {
		this.log.info( this.constructor.name + '.executeLocalPlay(.)');
		this._socket.emit('play message', JSON.stringify( localPlay ));

		jQuery.ajax({
			url:     this._executePlayUrl,
			type:    'POST',
			data: 	 JSON.stringify( localPlay ),
			success: (function( jqXHR, textStatus, errorThrown ) {
                this._receiveRemoteData( this.source.API, jqXHR, textStatus, errorThrown );
            }).bind( this ),
			error: 	 function( jqXHR, textStatus, errorThrown ) {
                        throw new Error ( errorThrown );
			}
		});
	}


	// constructor code
    this.playerId = guid();
    this.gameId = null;
    
	this._socket = socket;
	this._restBaseUrl = restBaseUrl;
    this._getGameUrl = this._restBaseUrl + '/Game';
    this._executePlayUrl = this._restBaseUrl + '/Game/{gameId}/Play';

    this.log.debug( this.constructor.name, '() - POST ' + this._getGameUrl ); 
    jQuery.ajax({
        url:     this._getGameUrl,
        type:    'POST',
        data: 	 JSON.stringify( { playerId : this.playerId } ),
			success: (function( jqXHR, textStatus, errorThrown ) {
                this._receiveRemoteData( this.source.API, jqXHR, textStatus, errorThrown );
            }).bind( this ),
        error: 	 function( jqXHR, textStatus, errorThrown ) {
                    throw new Error ( errorThrown );
        }
    });

	// event bindings - connection management 
	this._socket.on('gameEvent', (function( msg ) {
		this._receiveRemoteData( this.source.WEBSOCKET, msg );
 	}).bind( this ));

	this._socket.on('reconnect', (function( msg ) {
		this._reconnect( msg );
 	}).bind( this ));

}

RemoteProxy.prototype = Object.create(EventEmitter.prototype);

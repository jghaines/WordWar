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
    
    // request a game from the server
    this.getGame = function() {
        this.log.info(this.constructor.name + '.getGame()');
        this.log.debug( this.constructor.name, '() - POST ' + this._getGameUrl ); 
        var gameInfo = {
            playerList : [ { playerId : this.playerId } ]
        }; 
        if ( ENV && ENV.requestedBoard ) {
            gameInfo.board = ENV.requestedBoard;
        }
        jQuery.ajax({
            url:     this._getGameUrl,
            type:    'POST',
            data: 	 JSON.stringify( gameInfo ),
                success: (function( jqXHR, textStatus, errorThrown ) {
                    this._receiveRemoteData( this.source.API, jqXHR, textStatus, errorThrown );
                }).bind( this ),
            error: 	 function( jqXHR, textStatus, errorThrown ) {
                        throw new Error ( errorThrown );
            }
        });
    }

	//
    // called when we receive return data from the REST API or pushed from WebSocket
    // parse the data, fire callbacks
    //
    // @source API or WEBSOCKET
    // @data data bundle
    // @textStatus for REST API HTTP callback
    // @jqXHR for REST API HTTP callback
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

        // when we first receive our gameId, store it and subscribe
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
    
    // create a subscription on the game server for game event updates
    this._subscribeGameNotifications = function() {
        this.log.info( this.constructor.name + '._subscribeGameNotifications()' );
		// let the server know who we are
        var subscriptionData = { 
            gameId : this.gameId,
            playerId : this.playerId
        }
        this.log.debug( this.constructor.name, '_subscribeGameNotifications() - subscriptionData=', JSON.stringify( subscriptionData ));
        if ( subscriptionData.gameId && subscriptionData.playerId ) {
            this._socket.emit( 'subscribe', subscriptionData );            
        }
    }

    // when we have a websocket reconnect, (re-)subscribe to notifications
	this._reconnect = function( msg ) {
		this.log.info( this.constructor.name + '._reconnect(.)');

        this._subscribeGameNotifications();
	}

	//
	// called by Game object
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

	// event bindings - connection management 
	this._socket.on('gameEvent', (function( msg ) {
        log.debug( "WS['gameEvent']" );
		this._receiveRemoteData( this.source.WEBSOCKET, msg );
 	}).bind( this ));

	this._socket.on('connect', (function( msg ) {
        log.debug( "WS['connect'] - id=" + this._socket.io.engine.id );
 	}).bind( this ));
     
	this._socket.on('reconnect', (function( msg ) {
        log.debug( "WS['reconnect'] - id=" + this._socket.io.engine.id );
		this._reconnect( msg );
 	}).bind( this ));

}

// make the class an EventEmitter
RemoteProxy.prototype = Object.create(EventEmitter.prototype);

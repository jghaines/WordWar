/* global jQuery */
'use strict';


function RemoteProxy( socket, restBaseUrl ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	//
	// register callbacks
	//
	this.onStartGame = function(callback) {
		this.log.info( this.constructor.name + '.onNewGame(.) - callback registered');
		this._startGameCallbacks.add(callback);
	}

	this.onStartTurn = function( callback ) {
		this.log.info( this.constructor.name + '.onStartTurn(.) - callback registered');
		this._startTurnCallbacks.add(callback);
	}
    
    this.onTurnInfoReceived = function( callback ) {
		this.log.info( this.constructor.name + '.onTurnInfoReceived(.) - callback registered');
		this._turnInfoCallbacks.add(callback);
	}

	this.onPlaysReceived = function(callback) {
		this.log.info( this.constructor.name + '.onPlayReceived(.) - callback registered');
		this._playsReceivedCallbacks.add(callback);
	}


	//
	// server message receieve event handlers, fire callbacks
	//
	this._startGame = function(msg) {
		this.log.info( this.constructor.name + '._startGame(.)');
		this.log.info( this.constructor.name, '_startGame( msg', msg);
		this._startGameCallbacks.fire( JSON.parse( msg ));
	}

	this._startTurn = function(msg) {
		this.log.info( this.constructor.name + '._startTurn(.)');
		this.log.info( this.constructor.name, '_startTurn( msg', msg);

        this._turnInfoReceived( [ {
            turnIndex : 0,
            tiles : "ETANOISRLY"
        } ] );

		this._startTurnCallbacks.fire(msg);
	}

	this._remotePlayNotification = function( turnInfo ) {
		this.log.info( this.constructor.name + '._remotePlayNotification(.)');

        var turnInfoData = {
            gameId : turnInfo.gameId,
            turnIndex : turnInfo.turnIndex
        };
        
		jQuery.ajax({
			url: 	this._getPlayUrl,
			type: 	'POST',
			data: 	 JSON.stringify( turnInfoData ),
			success: this._receiveRemoteData.bind( this ),
			error: 	 function( jqXHR, textStatus, errorThrown ) {
                        throw new Error ( errorThrown );
			}
		});
	}

    this._receiveRemoteData = function( data, textStatus, jqXHR ) {
        this.log.info( this.constructor.name + '._receiveRemoteData()' );
        this.log.debug( this.constructor.name, '_receiveRemoteData( ', data );
        if ( data.hasOwnProperty( 'turnInfo' )) {
            this._turnInfoReceived( data.turnInfo );
        }
        if ( data.hasOwnProperty( 'moves' )) {
            this._playsReceived( data.moves );
        }
    }

    // we have received Play info from remote, parse and send on
    this._playsReceived = function( playList ) {
        var plays = [];
        playList.forEach( function( play ) {
            plays.push( new Play( play ));
        });
		this._playsReceivedCallbacks.fire( plays );
    }
    
    // we have received turn info from remote, send it on
    this._turnInfoReceived = function( turnInfoList ) {
		this._turnInfoCallbacks.fire( turnInfoList );
    }

	// connection management event handlers 
	this._receiveUserid = function( msg ) {
		this.log.info( this.constructor.name + '._receiveUserid(.)');
		this.log.debug( this.constructor.name, '_receiveUserid( msg', msg, ')');

		// first time connection, take user id
		if ( this._userid === undefined ) {
			this._userid = msg.userId;

			// confirm new id with server
			this._socket.emit( 'player', { userId : this._userid } );
		} 

	}

	this._reconnect = function( msg ) {
		this.log.info( this.constructor.name + '._reconnect(.)');
		this.log.debug( this.constructor.name, '._reconnect( msg=', msg, ')' );

		// let the server know who we are
		this._socket.emit( 'player', { userId : this._userid } );
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
			success: this._receiveRemoteData.bind( this ),
			error: 	 function( jqXHR, textStatus, errorThrown ) {
                        throw new Error ( errorThrown );
			}
		});
	}


	// constructor code
	this._socket = socket;
	this._restBaseUrl = restBaseUrl;
    this._executePlayUrl = this._restBaseUrl + '/ExecutePlay';
    this._getPlayUrl = this._restBaseUrl + '/GetPlay';

	this._startGameCallbacks = $.Callbacks();
	this._startTurnCallbacks = $.Callbacks();
    this._turnInfoCallbacks =  $.Callbacks();
	this._playsReceivedCallbacks = $.Callbacks();

	// event bindings - connection management 
	this._socket.on('userId', (function( msg ) {
		this._receiveUserid( msg );
 	}).bind( this ));

	this._socket.on('reconnect', (function( msg ) {
		this._reconnect( msg );
 	}).bind( this ));

	// event bindings - game events
	this._socket.on('new game', (function( msg ){
		this._startGame( msg );
	}).bind( this ));

	this._socket.on('start turn', (function( msg ){
		this._startTurn( msg );
	}).bind( this ));

	this._socket.on('play message', (function( msg ) {
		this._remotePlayNotification( JSON.parse( msg ));
	}).bind( this ));


}

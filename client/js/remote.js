/* global log */
/* global jQuery */
'use strict';


function RemoteProxy( idToken, userId, socket, restBaseUrl ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );
    this.swaggerUrl = '/js/swagger.json';

    // enum for remote data sources
    this.source = {
        WEBSOCKET   : { id:1, name: "WEBSOCKET" },
        API         : { id:2, name: "API" }
    };
    
    // enum for EventEmitter types
    this.Event = {
        GAME_INFO           : 'game_info',
        GAME_PLAYER_LIST    : 'game_player_list',
        GAME_LIST           : 'game_list',
        PLAY_INFO           : 'play_info',
        TURN_INFO           : 'turn_info',
    };

    this._SocketEvent = {
        SUBSCRIBE   : 'subscribe',
        GAME_EVENT  : 'gameEvent',
        PLAY        : 'play message',
    }

    // retrieve an AWS JWT token for AWS service calls
    // Auth0 is giving CORS errors on this request
    // https://support.auth0.com/#!/tickets/7275    
    this._getAwsToken = function() {
        var a0Params = {
            "client_id":   ENV.auth0.accountClientId,
            "target":      ENV.auth0.applicationClientId,
            "grant_type":  "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "id_token":    this._idToken,
            "api_type":    "aws",
            "role":        ENV.auth0.awsRole,
            "principal":   ENV.auth0.awsPrincipal,
        }
        jQuery.ajax({ type:    'POST',
            url:     ENV.auth0.delegationUrl,
            data: 	 a0Params,
            success: function( jqXHR, textStatus, errorThrown ) {
                console.log( JSON.stringify( jqXHR ));
            },
            error: 	 function( jqXHR, textStatus, errorThrown ) {
                    throw new Error ( errorThrown );
            }
        });
    }
    
    // request a new game from the server
    this.getGame = function() {
        this.log.info(this.constructor.name + '.getGame()');
        this.log.debug( this.constructor.name, '() - ' + this._endpoint.findNewGame ); 
        var gameInfo = {
            playerList : [ { playerId : this.playerId } ]
        }; 
        if ( ENV && ENV.requestedBoard ) {
            gameInfo.board = ENV.requestedBoard;
        }
        jQuery.ajax({
            type:    this._endpoint.findNewGame.method,
            url:     this._endpoint.findNewGame.url,
            headers: {
                'Authorization': 'Bearer ' + this._idToken,
                'Content-type' : 'application/json'
            },
            data: 	 JSON.stringify( gameInfo ),
                success: (function( jqXHR, textStatus, errorThrown ) {
                    this._receiveRemoteData( this.source.API, jqXHR, textStatus, errorThrown );
                }).bind( this ),
            error: 	 function( jqXHR, textStatus, errorThrown ) {
                console.log( 'getGame() -> error ' + textStatus );
                // throw new Error ( errorThrown );
            }
        });
    }
    
    // get our list of games
    this.getGamesForPlayer = function() {
        this.log.info(this.constructor.name + '.getGamesForPlayer()');
        this.log.debug( this.constructor.name, '() - ' + this._endpoint.getGamesForPlayer ); 

        jQuery.ajax({
            type:    this._endpoint.getGamesForPlayer.method,
            url:     this._endpoint.getGamesForPlayer.url,
            headers: {
                'Authorization': 'Bearer ' + this._idToken
            },
            success: (function( jqXHR, textStatus, errorThrown ) {
                this._receiveRemoteData( this.source.API, jqXHR, textStatus, errorThrown );
            }).bind( this ),
            error: 	 function( jqXHR, textStatus, errorThrown ) {
                console.error( 'getGamesForPlayer() -> error ' + textStatus );
            }
        });
    }

	this.loadGame = function( gameId ) {
        this.log.info(this.constructor.name + `.loadGame( gameId: ${ gameId } )`);
        this.log.debug( this.constructor.name, '() - ' + this._endpoint.getGame ); 
        var url = this._endpoint.getGame.url.replace( /{\s*gameId\s*}/, gameId );

        jQuery.ajax({
            type:    this._endpoint.getGame.method,
            url:     url,
            headers: {
                'Authorization': 'Bearer ' + this._idToken
            },
            success: (function( jqXHR, textStatus, errorThrown ) {
                this._receiveRemoteData( this.source.API, jqXHR, textStatus, errorThrown );
            }).bind( this ),
            error: 	 function( jqXHR, textStatus, errorThrown ) {
                console.error( 'loadGame() -> error ' + textStatus );
            }
        });
	}
    
    // test - invoke the server echo endpoint
    this.echo = function() {
        this.log.info(this.constructor.name + '.echo()');
        this.log.debug( this.constructor.name, '() - POST '  ); 
        var gameInfo = {
            playerList : [ { playerId : this.playerId } ]
        }; 
        if ( ENV && ENV.requestedBoard ) {
            gameInfo.board = ENV.requestedBoard;
        }
        jQuery.ajax({
            type:    'POST',
            url:      this._restBaseUrl + '/echo',
            headers: {
                'Authorization': 'Bearer ' + this._idToken,
                'Content-type' : 'application/json'
            },
            data: 	 JSON.stringify( gameInfo ),
                success: (function( jqXHR, textStatus, errorThrown ) {
                    console.log( JSON.stringify( jqXHR, null, 2 ));
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

        if ( data == null ) { 
            throw new Error( "_receiveRemoteData() - received null data result" );
        }

        if ( data.hasOwnProperty( 'errorMessage' )) { // API Gateway-Lambda error
            throw new Error( `Remote reports error message: ${ data.errorMessage }` );
        }

        // do this first in case subsequent events look up the player data        
        if ( data.hasOwnProperty( 'PlayerList' )) {
            this._playerListReceived( data.PlayerList );
        }

        if ( data.hasOwnProperty( 'GameList' )) {
            this._gameListReceived( data.GameList );
        }

        // game specific data
        var gameId = null;
        if ( data.hasOwnProperty( 'gameId' )) {
            gameId = data.gameId;
        }

        if ( data.hasOwnProperty( 'GameItem' )) {
            gameId = data.GameItem.gameId;
            this._gameItemReceived( data.GameItem );

            if ( data.GameItem.hasOwnProperty( 'turnInfo' )) {
                this._turnListReceived( gameId, data.GameItem.turnInfo );
            }
        }

        if ( gameId ) {
            if ( data.hasOwnProperty( 'PlayList' )) {
                this._playListReceived( gameId, data.PlayList );
            }

            if ( data.hasOwnProperty( 'GamePlayerList' )) {
                this._gamePlayerListReceived( gameId, data.GamePlayerList );
            }
        }
        
        // postback to notification websocket if the data didn't already come from there 
        if ( source != this.source.WEBSOCKET ) {
            this._socket.emit( this._SocketEvent.GAME_EVENT, data);
        }
    }

    // we have received game info from remote, send it on
    this._gameItemReceived = function( gameItem ) {
        this.log.info( this.constructor.name + '._gameItemReceived()' );

        // when we first receive our gameId, store it and subscribe
        if ( this.gameId !== gameItem.gameId ) {
            this.gameId = gameItem.gameId;
            this._subscribeGameNotifications();
        }

        // don't send the turn and play data with this callback
        var gameItemCopy = Object.assign( {}, gameItem );
        delete gameItemCopy.turnInfo;
        delete gameItemCopy.plays;
		this.emit( this.Event.GAME_INFO, gameItemCopy );
    }

    // we have received game player list from remote, send it on
    this._gamePlayerListReceived = function( gameId, gamePlayerList ) {
        this.log.info( this.constructor.name + '._gamePlayerListReceived()' );

		this.emit( this.Event.GAME_PLAYER_LIST, {
            gameId  : gameId,
            Items   : gamePlayerList 
        });
    }
    
    // we have received game info from remote, send it on
    this._playerListReceived = function( playerList ) {
        this.log.info( this.constructor.name + '._playerListReceived()' );

        playerList.forEach( player => {
            this.players[ player.userId ] = player;   
        })
        
    }

    // we have received Play info from remote, parse and send on
    this._playListReceived = function( gameId, playList ) {
        this.log.info( `${ this.constructor.name }._playListReceived( gameId: ${ gameId })` );
		this.emit( this.Event.PLAY_INFO, {
            gameId  : gameId,
            Items   : playList.map( play => new Play( play )) 
        });
    }
    
    // we have received Game list from remote, parse and send on
    this._gameListReceived = function( gameList ) {
        this.log.info( this.constructor.name + '._gameListReceived()' );
		this.emit( this.Event.GAME_LIST, gameList );
    }
    
    // we have received turn info from remote, send it on
    this._turnListReceived = function( gameId, turnList ) {
        this.log.info( this.constructor.name + `._turnListReceived(${ gameId })` );
		this.emit( this.Event.TURN_INFO, {
            gameId  : gameId,
            Items   : turnList 
        });
    }
    
    // create a subscription on the game server for game event updates
    this._subscribeGameNotifications = function() {
        this.log.info( this.constructor.name + '._subscribeGameNotifications()' );
		// let the server know who we are
        var subscriptionParams = { 
            gameId      : this.gameId,
            playerId    : this.playerId
        }
        this.log.debug( this.constructor.name, '_subscribeGameNotifications() - subscriptionParams=', JSON.stringify( subscriptionParams ));
        if ( subscriptionParams.gameId && subscriptionParams.playerId ) {
            this._socket.emit( this._SocketEvent.SUBSCRIBE, subscriptionParams );            
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
		this.log.debug( this.constructor.name, 'executeLocalPlay() - ', this._endpoint.putPlay);
        var url = this._endpoint.putPlay.url.replace( /{\s*gameId\s*}/, localPlay.gameId );

		this._socket.emit( this._SocketEvent.PLAY, JSON.stringify( localPlay ));

		jQuery.ajax({
			type:    this._endpoint.putPlay.method,
			url:     url,
            headers: {
                'Authorization': 'Bearer ' + this._idToken,
                'Content-type' : 'application/json'
            },
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
    this.playerId = userId;
    this.gameId = null;
    this.players = {};
    this.defaultPicture = '/images/player-1.png';
    
    this._idToken = idToken;
	this._socket = socket;
	this._restBaseUrl = restBaseUrl;
    this._endpoint = {
        findNewGame         : { method : 'POST',   url : this._restBaseUrl + '/Game' },
        getGamesForPlayer   : { method : 'GET',    url : this._restBaseUrl + '/Game' },
        getGame             : { method : 'GET',   url : this._restBaseUrl + '/Game/{gameId}' },
        putPlay             : { method : 'POST',   url : this._restBaseUrl + '/Game/{gameId}/Play' },
        getPlays            : { method : 'GET',    url : this._restBaseUrl + '/Game/{gameId}/Play' },
    }

	// event bindings - connection management 
	this._socket.on('gameEvent', (function( msg ) {
        log.debug( "WS['gameEvent']" );
		this._receiveRemoteData( this.source.WEBSOCKET, msg );
 	}).bind( this ));

	this._socket.on('connect', (function() {
        log.debug( "WS['connect'] - id=" + this._socket.io.engine.id );

        this._socket.emit('authenticate', { token: this._idToken }); //send the jwt
    }).bind( this ));

    this._socket.on('authenticated', function () { // no parameters
        log.debug( "ws#authenticated" );
    })
     
	this._socket.on('unauthorized', (function( msg ) {
        console.log("unauthorized: " + JSON.stringify(msg.data));
        throw new Error(msg.data.type);
 	}).bind( this ));
     
	this._socket.on('reconnect', (function( msg ) {
        log.debug( "WS['reconnect'] - id=" + this._socket.io.engine.id );
		this._reconnect( msg );
 	}).bind( this ));

}

// make the class an EventEmitter
RemoteProxy.prototype = Object.create(EventEmitter.prototype);

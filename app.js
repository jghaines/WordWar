#!/usr/bin/env node
/* global Buffer */
/* global process */

const _SocketEvent = {
        SUBSCRIBE   : 'subscribe',
        GAME_EVENT  : 'gameEvent',
        PLAY        : 'play message',
    }



require('dotenv').config();

var log = require('loglevel');
log.setLevel( log.levels.DEBUG );

var AWS = require('aws-sdk');
AWS.config.apiVersions = {
    dynamodb: '2012-08-10',
    lambda: '2015-03-31',
    sns: '2010-03-31',
    sqs: '2012-11-05'
};
AWS.config.update({region: 'us-west-2'});
var mds = new AWS.MetadataService();
var sns = new AWS.SNS();

var socketioJwt = require("socketio-jwt");

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var http = require('http');
var httpServer = http.Server(app);
var sio = require('socket.io')(httpServer);

app.set('port', (process.env.PORT || 5000));

var ENV = require('./node-config.json');

const SNS_ENDPOINT = '/GameEvent';
var snsActive = false; // whether this server is receiving SNS notifications

// allow CORS requests originating from the static data S3 bucket website
var corsOptions = {
    origin: 'http://wordwar-web-client.s3-website-us-west-2.amazonaws.com/'
};
app.use( cors( corsOptions ));

// SNS sends JSON as text/plain (idiots), so we need to override it before running the JSON bodyParser
// See: http://stackoverflow.com/questions/18484775/how-do-you-access-an-amazon-sns-post-body-with-express-node-js
app.use(SNS_ENDPOINT,  function overrideContentType(req, res, next) {
    if (req.headers['x-amz-sns-message-type']) {
        req.headers['content-type'] = 'application/json;charset=UTF-8';
    }
    next();
});
app.use( bodyParser.json() );

// respond to pings - e.g. ELB
app.get('/hello', function(req, res){
    log.info( '/hello' );
    res.send('<h1>WordWar app server</h1>\n');
});

// SNS subscriber endpoint
app.post(SNS_ENDPOINT, function(req, res){
    log.info( SNS_ENDPOINT );

    snsActive = true;

    if ( req.body.Type === "SubscriptionConfirmation" ) {
        log.info( '/GameEvent SubscriptionConfirmation' );
        var params = {
            Token: req.body.Token,
            TopicArn: req.body.TopicArn
        };
        sns.confirmSubscription(params, function(err, data) {
            if (err) {
                log.error( "/GameEvent sns.confirmSubscription callback error: " + err);
            } else {
                log.info( "/GameEvent sns.confirmSubscription callback success: " + JSON.stringify( data ));
            }
        });        
    } else if ( req.body.Type === "Notification" ) {
        log.info( '/GameEvent Notification' );
        var remoteBundle = JSON.parse( req.body.Message ); // SNS stringifies the (JSON) Message (idiots)
        log.debug( '/GameEvent Notification: ', JSON.stringify( remoteBundle ));
        
        notifySubscribers( remoteBundle, null );
    }
    // just return the body for debugging
    res.json( req.body );
});

//
// In development, node.js also server static assets
// In production, the static assets are depolyed on S3 and not deployed on node.js
//

// override static /js/env.js for development settings
app.use('/js/env.js', function(req, res, next) {
    log.info( '/js/env.js' );
    res.send(
'// development config generated from node:app.js' + '\n' +
'var ENV = {' + '\n' +
'    webSocketUrl    : null, // default to localhost' + '\n' +
'    restBaseUrl     : "https://fqjtrlps5h.execute-api.us-west-2.amazonaws.com/dev",' + '\n' +
'    auth0 : {' + '\n' +
'        domain              : "jghaines.auth0.com",' + '\n' +
'        accountClientId     : "dvfcaBbvoarFA2Q6zDZSoGfzLPq2XbXH",' + '\n' +
'        applicationClientId : "M69Mp6BBlK2CYo4MrUkBhiDKUpsg81vn",' + '\n' +
'        awsRole             : "arn:aws:iam::458298098107:role/wordwar-api-client",' + '\n' +
'        awsPrincipal        : "arn:aws:iam::458298098107:saml-provider/jghaines.auth0.com",' + '\n' +
'        delegationUrl       : "https://jghaines.auth0.com/delegation",' + '\n' +
'    },' + '\n' +
'    requestedBoard  : "/boards/2.html"' + '\n' +
'}' + '\n'
);
    res.end();
    // we are overriding express.static(..) below; we don't call next()
});

// serve up static data - HTML, CSS, Javascript game client
app.use(express.static(__dirname + '/client'));


//
// web socket connection events
//

sio.on('connection', function (client) {
	log.info('WS.connection()');
	log.debug('connection - client.id=', client.id);

    var res = ( socketioJwt.authorize({
		secret: Buffer(JSON.stringify(process.env.AUTH0_CLIENT_SECRET), 'base64'),
        timeout: 15000 // 15 seconds to send the authentication message
    }) )(client);

    // process subscribe events from client
	client.on( _SocketEvent.SUBSCRIBE, function(msg)  {
	    log.info('WS.subscribe()');
        subscribeClient(client, msg);
	});
	client.on( _SocketEvent.GAME_EVENT, function(msg)  {
        log.info( 'WS.gameEvent()' );
        receiveWebSocketGameEvent(msg, client);
	});
});
    
sio.on('authenticated', function(socket) {
    //this socket is authenticated, we are good to handle more events from it.
    socket.client.auth0_sub = socket.decoded_token.sub;
    console.log('sio.on#authenticated auth0_sub = ' + socket.decoded_token.sub);
});
    
sio.on('reconnection', function (client) {
	log.info('WS.reconnection()');
	log.debug('WS.reconnection() - client.id=', client.id);
	log.debug('WS.reconnection() - client.id=', client.id);
});

sio.on('reconnect', function (client) {
	log.info('WS.reconnect()');
	log.debug('WS.reconnect() - client.id=', client.id);
});

sio.on('disconnect', function (client) {
	log.info('WS.disconnect()');
	log.debug('WS.disconnect() - client.id=', client.id);
});

// subscribe the given client to events from given game
// msg.gameId UUID of game
// msg.playerId UUID of player
var subscribeClient = function(socket, msg) {
	log.info('subscribeClient()');
	log.debug('subscribeClient( client.id=' + socket.id + ', msg = ' + JSON.stringify(msg) + ')');
    log.debug('subscribeClient auth0_sub = ' + socket.client.auth0_sub);

    var gameId = msg.gameId;
    var playerId = socket.client.auth0_sub;
    subscriptions[gameId] = subscriptions[gameId] || [];

    // update existing
    var found = false;
    subscriptions[gameId].forEach( function( gameSub ) {
        if ( gameSub.playerId === playerId ) {
            gameSub.client = client;
            found = true;
        }
    });
    // or add new
    if ( ! found ) {
        subscriptions[gameId].push( {
            playerId : playerId,
            socket : socket
        })
    }
}

// callback on receipt of GameEvent from a websocket client
var receiveWebSocketGameEvent = function(msg, socket) {
	log.info('receiveWebSocketGameEvent(..)');
    if ( !snsActive ) { // if we are in SNS mode, don't propagate websocket GameEvents
        notifySubscribers(msg, socket.client.auth0_sub);
    }
}


// we have SNS/websocket received a game update - distribute it
// @param remoteBundle object
// @param exceptClient optional - don't notify this client
var notifySubscribers = function( remoteBundle, exceptPlayerId ) {
	log.info('notifySubscribers()');

    var gameId;
    if ( remoteBundle.hasOwnProperty( 'gameId' ) ) {
        gameId = remoteBundle.gameId;
    } else if ( remoteBundle.hasOwnProperty( 'GameItem' ) && remoteBundle.GameItem.hasOwnProperty( 'gameId' ) ) {
        gameId = remoteBundle.GameItem.gameId;
    } else {
        throw new Error( "No gameId found in remoteBundle" );
    }
    
 	log.debug('notifySubscribers( exceptPlayerId.=' + exceptPlayerId  + ', gameId=' + gameId + ')' );
    if ( subscriptions[gameId] ) {
        subscriptions[gameId].forEach( subscriber => {
            if ( subscriber.playerId !== exceptPlayerId ) {
            	log.debug('notifySubscribers() - emit to client.playerId=' + subscriber.playerId );
                subscriber.socket.emit( _SocketEvent.GAME_EVENT, remoteBundle ); 
            }
        });
    } 
}

var retreiveInstanceDns = function() {
	log.info('retreiveInstanceDns()');

    mds.httpOptions.timeout = 1000/*ms*/;

    mds.request('/latest/meta-data/public-hostname', function(err, dns) {
        if ( err !== null ) {
            log.info("retreiveInstanceDns() - no EC2 detected");
        } else {
            subscribeToSNS( 'http://' + dns + SNS_ENDPOINT )
        }
    });
}

var subscribeToSNS = function( url ) {
	log.info('subscribeToSNS(.)');
	log.debug('subscribeToSNS(url = ' + url + ')');

    var params = {
        Protocol: 'HTTP',
        TopicArn: ENV.snsArn,
        Endpoint: url
    };
    sns.subscribe(params, function(err, data) {
        if (err) {
            log.error("subscribeToSNS() sns.subscribe callback error: " + JSON.stringify( err ));
        } else {
            log.debug("subscribeToSNS() sns.subscribe callback success: " + JSON.stringify( data ));
        }
    });
}

// 2-dimensional array of subscriptions[gameId][] = { playerId: 'uuid', client: obj }
var subscriptions = [];

retreiveInstanceDns();

httpServer.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

#!/usr/bin/env node
/* global Buffer */
/* global process */

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

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http');
var httpServer = http.Server(app);
var sio = require('socket.io')(httpServer);

app.set('port', (process.env.PORT || 5000));

var ENV = require('./node-config.json');

const SNS_ENDPOINT = '/GameEvent';
var snsActive = false; // whether this server is receiving SNS notifications


// SNS sends JSON as text/plain (idiots), so we need to override it before running the JSON bodyParser
// See: http://stackoverflow.com/questions/18484775/how-do-you-access-an-amazon-sns-post-body-with-express-node-js
app.use(SNS_ENDPOINT,  function overrideContentType(req, res, next) {
    if (req.headers['x-amz-sns-message-type']) {
        req.headers['content-type'] = 'application/json;charset=UTF-8';
    }
    next();
});
app.use( bodyParser.json() );

// serve up static data - HTML, CSS, Javascript game client
app.use(express.static(__dirname + '/client'));

// respond to pings - e.g. ELB
app.get('/hello', function(req, res){
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
                log.info( "/GameEvent sns.confirmSubscription callback success: " + data);
            }
        });        
    } else if ( req.body.Type === "Notification" ) {
        log.info( '/GameEvent Notification' );
        var gameInfo = JSON.parse( req.body.Message ); // SNS stringifies the (JSON) Message (idiots)
        log.debug( '/GameEvent Notification: ', JSON.stringify( gameInfo ));
        
        notifySubscribers( gameInfo );
    }
    // just return the body for debugging
    res.json( req.body );
});

//
// web socket connection events
//

sio.on('connection', function (client) {
	log.info('connection');
	log.debug('connection - client.id=', client.id);

    // process subscribe events from client
	client.on('subscribe', function(msg)  {
        subscribeClient(client, msg);
	});
	client.on('gameEvent', function(msg)  {
        notifySubscribers(msg, client);
	});
});

sio.on('reconnection', function (client) {
	log.info('reconnection');
	log.debug('reconnection - client.id=', client.id);
});

sio.on('reconnect', function (client) {
	log.info('reconnect');
	log.debug('reconnect - client.id=', client.id);
});

sio.on('disconnect', function (client) {
	log.info('disconnect');
	log.debug('disconnect - client.id=', client.id);
});

// subscribe the given client to events from given game
// msg.gameId UUID of game
// msg.playerId UUID of player
var subscribeClient = function(client, msg) {
	log.info('subscribeClient()');
	log.debug('subscribeClient( client.id=' + client.id + ', msg = ' + JSON.stringify(msg) + ')');

    var gameId = msg.gameId;
    var playerId = msg.playerId;
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
            client : client
        })
    }
}

// we have SNS/websocket received a game update - distribute it
// @gameInfo - object
// @exceptClient - optional - don't notify this client
var notifySubscribers = function( gameInfo, exceptClient ) {
	log.info('notifySubscribers()');
	log.debug('notifySubscribers( gameInfo=' + JSON.stringify(gameInfo) + ', exceptClient.id=' + exceptClient.id + ')');

    var gameId = gameInfo.gameId;
    if ( !snsActive && // in SNS mode, we only send SNS events, not these peer->node->peer ones
        subscriptions[gameId] ) {
        subscriptions[gameId].forEach( function( subscriber ) {
            if ( subscriber.client !== exceptClient ) {
                subscriber.client.emit( 'gameEvent', gameInfo ); 
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

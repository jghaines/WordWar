'use strict';

var lib = require('../../lib');

module.exports.handler = function( event, context ) {
  lib.getGameAsync( event ).then( function( result ) {
      context.succeed( result );
  }).catch( function( err ) {
      context.fail( err );
  });
};

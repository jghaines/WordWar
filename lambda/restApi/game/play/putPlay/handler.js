'use strict';

var lib = require('../../../lib');

module.exports.handler = function( event, context ) {
  if ( ! event ) throw new TypeError( "Expected 'event' parameter" );

  lib.putPlay( event )
    .then( context.succeed ); 
};

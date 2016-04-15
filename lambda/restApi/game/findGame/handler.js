'use strict';

var lib = require('../../lib');

module.exports.handler = function( event, context ) {
  lib.getGame( event )
    .then( context.succeed ); 
};

'use strict';

var lib = require('../../lib');

module.exports.handler = function( event, context ) {
  lib.findOrCreateGame( event )
    .then( context.succeed ); 
};

'use strict';

var lib = require('../../../lib');

module.exports.handler = function( event, context ) {

  lib.putPlay( event, function( error, response ) {
    return context.done( error, response );
  });
};

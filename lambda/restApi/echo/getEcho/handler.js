'use strict';

var lib = require('../../lib');

module.exports.handler = function( event, context ) {
    var result = {
        event : event,
        context : context
    };
    console.log( JSON.stringify( result, null, 2 ));
    context.succeed( result );
};

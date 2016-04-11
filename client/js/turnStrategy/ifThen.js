'use strict';

// apply each ConditionalMetaStrategy rule
//  if all the 'ifTrue' evaluate to true then execute every 'thenDo' strateg(ies)
// @if 
// @then   
// new IfThenStrategy( 
//    { ifTrue : [ new PlayTypeCombinationConditionalStrategy( [ 'attack', 'move' ] ) ], thenDo : [ new OtherStrategy(), ... ] }, ...
// )
function IfThenStrategy( parameters ) {
	this.execute = function( plays ) {
        if ( this._ifTrue.execute( plays )) {
            return this._thenDo.execute( plays );
        }
    }

    if ( typeof parameters.ifTrue === 'undefined' ) throw new Error( this.constructor.name + '() expected ifTrue parameter' );
    if ( typeof parameters.thenDo === 'undefined' ) throw new Error( this.constructor.name + '() expected thenDo parameter' );
    
    this._ifTrue = ( Array.isArray( parameters.ifTrue ) ? new CompositeStrategy( parameters.ifTrue ) : parameters.ifTrue );
    this._thenDo = ( Array.isArray( parameters.thenDo ) ? new CompositeStrategy( parameters.thenDo ) : parameters.thenDo );
}

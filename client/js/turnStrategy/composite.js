'use strict';

function CompositeStrategy( StrategyList ) {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.SILENT );

	this.execute = function( plays ) {
        var allTrue = true;
		this._StrategyList.forEach( (function( Strategy ) {
	 		this.log.debug( this.constructor.name, '.execute (', plays, ') - strategy:', Strategy.constructor.name );
			allTrue = Strategy.execute( plays ) && allTrue;
		}).bind( this ) );
        return allTrue;
 	}
 
 	this._StrategyList = StrategyList;
 }

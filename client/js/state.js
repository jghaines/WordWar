'use strict';

function StateInitial() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	this.localMove = function(context) {
		this.log.info('StateInitial -(localMove)-> StateWaitForRemote')
		context.setState(new StateWaitForRemote());	
	}

	this.remoteMove = function(context) {
		this.log.info('StateInitial -(remoteMove)-> StateWaitForLocal')
		context.setState(new StateWaitForLocal());	
	}

	this.moveComplete = function(context) {
		this.log.error('StateWaitForLocal -(moveComplete)-> ERROR')
		// error
	}
}

function StateWaitForRemote() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	this.localMove = function(context) {
		this.log.error('StateWaitForRemote -(localMove)-> ERROR')
		// error
	}

	this.remoteMove = function(context) {
		this.log.info('StateWaitForLocal -(remoteMove)-> StateInitial')
		context.setState(new StateTerminal());	
		context.moveComplete();
	}

	this.moveComplete = function(context) {
		this.log.error('StateWaitForRemote -(moveComplete)-> ERROR')
		// error
	}
}


function StateWaitForLocal() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );

	this.localMove = function(context) {
		this.log.info('StateWaitForLocal -(localMove)-> StateTerminal')
		context.setState(new StateTerminal());	
		context.moveComplete();
	}

	this.remoteMove = function(context) {
		this.log.error('StateWaitForLocal -(remoteMove)-> ERROR')
		// error
	}

	this.moveComplete = function(context) {
		this.log.error('StateWaitForLocal -(moveComplete)-> ERROR')
		// error
	}
}

function StateTerminal() {
	this.log = log.getLogger( this.constructor.name );
	this.log.setLevel( log.levels.DEBUG );
	
	this.localMove = function(context) {
		this.log.error('StateTerminal -(localMove)-> ERROR')
	}

	this.remoteMove = function(context) {
		this.log.error('StateTerminal -(remoteMove)-> ERROR')
	}

	this.moveComplete = function(context) {
		this.log.info('StateTerminal -(moveComplete)-> StateInitial')
		context.setState(new StateInitial());
	}
}



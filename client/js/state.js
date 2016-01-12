'use strict';

function StateInitial() {
	this.localMove = function(context) {
		log.info('StateInitial -(localMove)-> StateWaitForRemote')
		context.setState(new StateWaitForRemote());	
	}

	this.remoteMove = function(context) {
		log.info('StateInitial -(remoteMove)-> StateWaitForLocal')
		context.setState(new StateWaitForLocal());	
	}

	this.moveComplete = function(context) {
		log.error('StateWaitForLocal -(moveComplete)-> ERROR')
		// error
	}
}

function StateWaitForRemote() {
	this.localMove = function(context) {
		log.error('StateWaitForRemote -(localMove)-> ERROR')
		// error
	}

	this.remoteMove = function(context) {
		log.info('StateWaitForLocal -(remoteMove)-> StateInitial')
		context.setState(new StateTerminal());	
		context.moveComplete();
	}

	this.moveComplete = function(context) {
		log.error('StateWaitForRemote -(moveComplete)-> ERROR')
		// error
	}
}


function StateWaitForLocal() {
	this.localMove = function(context) {
		log.info('StateWaitForLocal -(localMove)-> StateInitial')
		context.moveComplete();
		context.setState(new StateTerminal());	
	}

	this.remoteMove = function(context) {
		log.error('StateWaitForLocal -(remoteMove)-> ERROR')
		// error
	}

	this.moveComplete = function(context) {
		log.error('StateWaitForLocal -(moveComplete)-> ERROR')
		// error
	}
}

function StateTerminal() {
	this.localMove = function(context) {
		log.error('StateTerminal -(localMove)-> ERROR')
	}

	this.remoteMove = function(context) {
		log.error('StateTerminal -(remoteMove)-> ERROR')
	}

	this.moveComplete = function(context) {
		context.setState(new StateInitial());
	}
}



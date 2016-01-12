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
}

function StateWaitForRemote() {
	this.localMove = function(context) {
		log.error('StateWaitForRemote -(localMove)-> ERROR')
		// error
	}

	this.remoteMove = function(context) {
		log.error('StateWaitForLocal -(remoteMove)-> StateInitial')
		context.moveComplete();
		context.setState(new StateInitial());	
	}
}


function StateWaitForLocal() {
	this.localMove = function(context) {
		log.error('StateWaitForLocal -(localMove)-> StateInitial')
		context.moveComplete();
		context.setState(new StateInitial());	
	}

	this.remoteMove = function(context) {
		log.error('StateWaitForLocal -(remoteMove)-> ERROR')
		// error
	}
}


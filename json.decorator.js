'use strict';

module.exports = class JsonDecorator {

	constructor(/* arguments */) {
		this.objectList = Array.from(arguments);
	}

	toJSON() {
		var json = {};
		this.objectList.forEach( function( obj ) {
			Object.keys( obj ).forEach( function( key ) {
				json[key] = obj[key];
			});

		});
		return json;
	}
}

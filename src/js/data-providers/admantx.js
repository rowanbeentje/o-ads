const utils = require('../utils');
const config = require('../config');
const targeting = require('../targeting');


function Admantx() {

}

Admantx.prototype.init = function() {
	this.config = config('admantx') || {};
	if (this.config.id) {
		this.collections = this.config.collections || {admants: true};
		this.api = this.config.url || 'http://usasync01.admantx.com/admantx/service?request=';
		this.makeAPIRequest();
	}
};

Admantx.prototype.makeAPIRequest = function() {
	const requestData = {
		"key": this.config.id,
		"method":"descriptor",
		"mode":"async",
		"decorator":"template.ft",
		"filter":["default"],
		"type":"URL",
		"body": encodeURIComponent(utils.getLocation())
	};
	const url = this.api + encodeURIComponent(JSON.stringify(requestData));
	this.xhr = utils.createCORSRequest(url, 'GET', this.resolve.bind(this), this.resolve.bind(this));
};

Admantx.prototype.processCollection = function(collection, max) {
	const names = [];
	const j = utils.isNumeric(max) ? Math.min(max, collection.length) : collection.length;
	for (let i=0; i < j; i++) {
		names.push(collection[i].name || collection[i]);
	}

	return names;
};

Admantx.prototype.resolve = function(response){
	const collections = this.collections;
	const targetingObj = {};
	let collection;
	let shortName;
	/* istanbul ignore else  */
	if (utils.isString(response)) {
		try {
			response = JSON.parse(response);
		} catch (e) {
			/* istanbul ignore next  */
			// if the response is not valid JSON;
			response = false;
		}
	}

	//parse required targetting data from the response
	/* istanbul ignore else  */
	if (response) {
		for (collection in collections) {
			/* istanbul ignore else  */
			if (collections.hasOwnProperty(collection) && collections[collection] && response[collection]) {
				shortName = collection.substr(0, 2);
				targetingObj[shortName] = this.processCollection(response[collection], collections[collection]);
			}
		}

		targeting.add(targetingObj);
	}
};

Admantx.prototype.debug = function() {
	const log = utils.log;

	if (!this.config) {
			return;
	}

	log.start('Admantx');
		log('%c id:', 'font-weight: bold', this.config.id);
		log('%c api:', 'font-weight: bold', this.api);

		if (this.config.collections) {
			log.start('Collections');
				log('%c admants:', 'font-weight: bold' ,this.config.collections.admants);
				log('%c categories:', 'font-weight: bold', this.config.collections.categories);
			log.end();
		}

		if (this.xhr && this.xhr.response) {
			log.start('Response');
				log.start('Admants');
					log.attributeTable(this.xhr.response.admants, ['value']);
				log.end();
				log.start('Categories');
					log.attributeTable(this.xhr.response.categories, ['value']);
				log.end();
			log.end();
		}
	log.end();
};

module.exports = new Admantx();

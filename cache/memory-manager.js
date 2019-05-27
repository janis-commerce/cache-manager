'use strict';

const LRU = require('lru-cache');
const md5 = require('md5');

/**
*    MemoryManager class - Singleton
*/

class MemoryManager {
	// INICIALIZA
	static iniciar(client) {

		if(this.keyPrefix)
			this.reset();

		this.instances = {};
		this.keyPrefix = client;
	}

	// SETTER Y GETTER
	static set keyPrefix(prefix) {
		this._keyPrefix = prefix;
	}

	static get keyPrefix() {
		return this._keyPrefix;
	}

	static getInstance(key) {
		key = this._getInstanceKey(key);

		if(!this.checkInstance(key)) {
			this.instances[key] = new LRU({
				max: 500,
				maxAge: 1000 * 60 * 60 // 1 hour default max age
				// Implement dispose function if we are saving in cache a value that needs to be close gracefully: File descriptor, database...
			});
		}

		return this.instances[key];
	}

	// """"PRIVADOS"""""
	static checkInstance(key) {
		return typeof this.instances[key] !== 'undefined';
	}

	// """"PRIVADOS"""""
	static _getInstanceKey(key) {
		return `${this.keyPrefix}${key}`;
	}

	// """"PRIVADOS"""""
	static _getKey(key, subkey) {
		return subkey !== '' ? `${key}-${subkey}` : key;
	}

	static _prepareParams(params) {
		return md5(JSON.stringify({
			_MS: this.MS,
			...params
		}));
	}

	// ""PUBLICOS"
	static set(key, subkey = '', value) {

		return this.getInstance(key).set(this._getKey(key, this._prepareParams(subkey)), value);
	}

	// ""PUBLICOS"
	static async get(key, subkey = '') {
		return this.getInstance(key).get(this._getKey(key, this._prepareParams(subkey)));
	}

	// ""PUBLICOS"
	static async reset(key = null) {
		if(key) {
			key = this._getInstanceKey(key);

			if(this.checkInstance(key))
				return this.resetInstance(key);
		} else return this.resetAllInstances();
	}

	// """"PRIVADOS"""""
	static resetAllInstances() {

		if(!this.instances)
			return null;

		return Promise.all(
			Object.keys(this.instances).map(key => this.resetInstance(key))
		);
	}

	// """"PRIVADOS"""""
	static async resetInstance(key) {
		return process.nextTick(() => {
			if(this.checkInstance(key))
				this.instances[key].reset();
		});
	}

	static prune(key) {
		key = this._getInstanceKey(key);
		if(this.checkInstance(key))
			this.instances[key].prune();
	}
}

// module.exports = new MemoryManager(); // no va
module.exports = MemoryManager;

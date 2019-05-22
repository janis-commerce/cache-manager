'use strict';

const LRU = require('lru-cache');

class MemoryManager {
	constructor() {
		this.instances = {};
	}

	set keyPrefix(prefix) {
		this._keyPrefix = prefix;
	}

	get keyPrefix() {
		return this._keyPrefix;
	}

	checkInstance(key) {
		return typeof this.instances[key] !== 'undefined';
	}

	_getInstanceKey(key) {
		return `${this.keyPrefix}${key}`;
	}

	getInstance(key) {
		key = this._getInstanceKey(key);

		if(!this.checkInstance(key)) {
			this.instances[key] = LRU({
				max: 500,
				maxAge: 1000 * 60 * 60
			});
		}
		return this.instances[key];
	}

	_getKey(key, subkey) {
		return subkey !== '' ? `${key}-${subkey}` : key;
	}

	/*
	set(key, value, subkey = '') {
		this.performance.addRequest('memorySet', key);
		return this.getInstance(key).set(this._getKey(key, subkey), value);
	}
	*/

	async reset(key) {
		if(key) {
			key = this._getInstanceKey(key);

			// eslint-disable-next-line nonblock-statement-body-position
			if(this.checkInstance(key)) return this.resetInstance(key);
		} else return this.resetAllInstances();
	}

	resetAllInstances() {
		return Promise.all(
			Object.keys(this.instances).map(key => this.resetInstance(key))
		);
	}

	async resetInstance(key) {
		return process.nextTick(() => {
			// eslint-disable-next-line nonblock-statement-body-position
			if(this.checkInstance(key)) this.instances[key].reset();
		});
	}
}

module.exports = new MemoryManager();

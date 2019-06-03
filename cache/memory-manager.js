'use strict';

const LRU = require('lru-cache');
const md5 = require('md5');

/**
 *	MemoryManager class - Static
 */

class MemoryManager {

	static get MS() {
		return process.env.MICROSERVICE || 'node';
	}

	static set keyPrefix(prefix) {
		this._keyPrefix = prefix;
	}

	static get keyPrefix() {
		return this._keyPrefix;
	}

	/**
	 * Initialize a Memory Instances in order to be ready to use
	 * @param {string} client Name of the Client
	 */
	static initialize(client) {
		if(this.keyPrefix)
			return;

		this.instances = {};
		this.keyPrefix = client;
	}

	/**
	 * Returns the correct name of the Key
	 * @param {string} key
	 * @returns {string}
	 */
	static _getInstanceKey(key) {
		return `${this.keyPrefix}${key}`;
	}

	/**
	 * Checks if the Instance is a valid one.
	 * @param {string} key
	 * @returns {boolean}
	 */
	static checkInstance(key) {
		return typeof this.instances[key] !== 'undefined';
	}

	/**
	 * Returns the Memory Instance.
	 * @param {string} key
	 * @returns {object} LRU-Instance
	 */
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

	/**
	 * Returns the right format of Key-Subkey
	 * @param {string} key Instance
	 * @param {string} subkey Parametres
	 * @returns {string}
	 */
	static _getKey(key, subkey) {
		return subkey !== '' ? `${key}-${subkey}` : key;
	}

	/**
	 * Prepares the params, adding MS prefix     *
     * @param {object} params The parameters
     * @return {string} encoded parameters
     */
	static _prepareParams(params) {
		return md5(JSON.stringify({
			_MS: this.MS,
			...params
		}));
	}

	/**
	 * Save values in memory. If the Instance and Parametres exists override de value.
	 * @param {string} key Intance
	 * @param {string} subkey Params
	 * @param {string} value Results
	 * @returns {boolean} true if success.
	 */
	static set(key, subkey = '', value) {
		const newParams = this._prepareParams(subkey);
		return this.getInstance(key).set(this._getKey(key, newParams), value);
	}

	/**
	 * Search the value by Instance and Parametres
	 * @param {string} key Instance
	 * @param {string} subkey Parametres
	 * @returns {*} Results, 'undefined' if not found
	 */
	static async get(key, subkey = '') {
		return this.getInstance(key).get(this._getKey(key, this._prepareParams(subkey)));
	}

	/**
	 * Delete values in memory on the next loop
	 * @param {string=} key entity. Delete All by Default
	 * @returns {Promise}
	 */
	static async reset(key = null) {
		if(key) {
			key = this._getInstanceKey(key);
			if(this.checkInstance(key))
				return this.resetInstance(key);
		} else
			return this.resetAllInstances();
	}

	/**
	 * Delete all instances on the next loop
	 * @returns {Array} Array length = Number of Instances deleted
	 */
	static resetAllInstances() {

		if(!this.instances)
			return null;


		return Promise.all(
			Object.keys(this.instances).map(key => this.resetInstance(key))
		);
	}

	/**
	 * Delete an Entity on the next loop
	 * @param {string} key Instance
	 * @returns {Promise}
	 */
	static async resetInstance(key) {

		if(this.checkInstance(key))
			this.instances[key].reset();

	}

	/**
	 * Manually iterates over the entire cache proactively pruning old entries
	 * @param {string=} key Instance. Delete All by Default
	 * @returns {Promise}
	 */
	static async prune() {
		return this.pruneAllInstances();
	}

	/**
	 * Prune All Instances
	 * @returns {Promise}
	 */
	static pruneAllInstances() {

		if(!this.instances)
			return null;

		return Promise.all(
			Object.keys(this.instances).map(key => this.pruneInstance(key))
		);
	}

	/**
	 * Prune a single Instance
	 * @param {string} key Instance
	 * @returns {Promise}
	 */
	static pruneInstance(key) {

		if(this.checkInstance(key))
			this.instances[key].prune();

	}


}

module.exports = MemoryManager;

'use strict';

const LRU = require('lru-cache');
const md5 = require('md5');
const logger = require('@janiscommerce/logger');
const CacheManagerError = require('./cache-manager-error');

/**
 *	MemoryManager class
 */

class MemoryManager {

	get MS() {
		return process.env.MICROSERVICE || 'node';
	}

	set keyPrefix(prefix) {
		this._keyPrefix = prefix;
	}

	get keyPrefix() {
		return this._keyPrefix;
	}

	/**
	 * Initialize a Memory Instances in order to be ready to use
	 * @param {string} client Name of the client-prefix
	 */
	constructor(clientPrefix) {
		this.instances = {};
		this.keyPrefix = this.validClientPrefix(clientPrefix);
		logger.info(`Cache memory - Client: ${this.keyPrefix}`);
	}

	/**
	 *
	 * @param {String} prefix name of prefix.
	 * @returns {String} prefix name.
	 */
	validClientPrefix(clientPrefix) {
		if(typeof clientPrefix !== 'string')
			throw new CacheManagerError('Invalid client-prefix.', CacheManagerError.codes.INVALID_PREFIX);
		return clientPrefix;
	}

	/**
	 * Returns the correct name of the Key
	 * @param {string} key
	 * @returns {string}
	 */
	getInstanceKey(key) {
		return `${this.keyPrefix}${key}`;
	}

	/**
	 * Checks if the Instance is a valid one.
	 * @param {string} key
	 * @returns {boolean}
	 */
	checkInstance(key) {
		return typeof this.instances[key] !== 'undefined';
	}

	/**
	 * Returns the Memory Instance.
	 * @param {string} key
	 * @returns {object} LRU-Instance
	 */
	getInstance(key) {
		key = this.getInstanceKey(key);

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
	getKey(key, subkey = '') {
		return subkey !== '' ? `${key}-${subkey}` : key;
	}

	/**
	 * Prepares the params, adding MS prefix     *
     * @param {object} params The parameters
     * @return {string} encoded parameters
     */
	_prepareParams(params) {
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
	set(key, subkey, value) {
		if(!key || !subkey || !value)
			throw new CacheManagerError('SET - Missing parametres.', CacheManagerError.codes.MISSING_PARAMETRES);
		const newParams = this._prepareParams(subkey);
		return this.getInstance(key).set(this.getKey(key, newParams), value);
	}

	/**
	 * Search the value by Instance and Parametres
	 * @param {string} key Instance
	 * @param {string} subkey Parametres
	 * @returns {*} Results, 'undefined' if not found
	 */
	async get(key, subkey) {


		if(!key || !subkey)
			throw new CacheManagerError('GET - Missing parametres.', CacheManagerError.codes.MISSING_PARAMETRES);
		return this.getInstance(key).get(this.getKey(key, this._prepareParams(subkey)));
	}

	/**
	 * Delete values in memory on the next loop
	 * @param {string=} key entity. Delete All by Default
	 * @returns {Promise}
	 */
	async reset(key = null) {

		if(!key)
			return this.resetAll();

		key = this.getInstanceKey(key);

		if(this.checkInstance(key))
			this._resetEntity(key);

		/* if(key) {
			key = this.getInstanceKey(key);
			if(this.checkInstance(key))
				return this._resetEntity(key);
			return;
		}
		return this.resetAll(); */
	}

	/**
	 * Delete all instances on the next loop
	 * @returns {Array} Array length = Number of Instances deleted
	 */
	resetAll() {

		if(Object.keys(this.instances).length === 0)
			return null;

		return Promise.all(
			Object.keys(this.instances).map(key => this._resetEntity(key))
		);
	}

	/**
	 * Delete an Entity on the next loop
	 * @param {string} key Instance
	 * @returns {Promise}
	 */
	async _resetEntity(key) {
		this.instances[key].reset();
	}

	/**
	 * Manually iterates over the entire cache proactively pruning old entries
	 * @param {string=} key Instance. Delete All by Default
	 * @returns {Promise}
	 */
	async prune() {
		return this._pruneAll();
	}

	/**
	 * Prune All Instances
	 * @returns {Promise}
	 */
	_pruneAll() {

		return Promise.all(
			Object.keys(this.instances).map(key => this._pruneEntity(key))
		);
	}

	/**
	 * Prune a single Instance
	 * @param {string} key Entity
	 */
	_pruneEntity(key) {
		this.instances[key].prune();
	}
}

module.exports = MemoryManager;

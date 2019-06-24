/* eslint-disable import/no-dynamic-require */

'use strict';

const md5 = require('md5');
const logger = require('@janiscommerce/logger');
const path = require('path');

const LRU = require(path.join(process.cwd(), 'node_modules', 'lru-cache'));
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
	 * @param {String} client Name of the client-prefix
	 */
	constructor(clientPrefix) {
		this.instances = {};
		this.keyPrefix = this.validateClientPrefix(clientPrefix);
		logger.info(`Cache memory - Client-Prefix: ${this.keyPrefix}`);
		this.inited = false;
	}

	/**
	 * Check the client-prefix
	 * @param {String} prefix name of prefix.
	 * @returns {String} prefix name.
	 */
	validateClientPrefix(clientPrefix) {
		if(typeof clientPrefix !== 'string')
			throw new CacheManagerError('Invalid client-prefix.', CacheManagerError.codes.INVALID_PREFIX);
		return clientPrefix;
	}

	/**
	 * Returns the correct name of the Key
	 * @param {String} key
	 * @returns {String}
	 */
	getInstanceKey(key) {
		return `${this.keyPrefix}${key}`;
	}

	/**
	 * Checks if the Instance is a valid one.
	 * @param {String} key
	 * @returns {boolean}
	 */
	checkInstance(key) {
		return typeof this.instances[key] !== 'undefined';
	}

	/**
	 * Returns the Memory Instance.
	 * @param {String} key
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
		this.inited = true;
		return this.instances[key];
	}

	/**
	 * Returns the right format of Key-Subkey
	 * @param {String} key Instance
	 * @param {String} subkey Parametres
	 * @returns {String}
	 */
	getKey(key, subkey = '') {
		return subkey !== '' ? `${key}-${subkey}` : key;
	}

	/**
	 * Prepares the params, adding MS prefix     *
     * @param {object} params The parameters
     * @return {String} encoded parameters
     */
	_prepareParams(params) {
		return md5(JSON.stringify({
			_MS: this.MS,
			...params
		}));
	}


	/**
	 * Save values in memory. If the Instance and Parametres exists override de value.
	 * @param {String} key Intance
	 * @param {String} subkey Params
	 * @param {String} value Results
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
	 * @param {String} key Instance
	 * @param {String} subkey Parametres
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
			return this._resetAll();

		key = this.getInstanceKey(key);

		if(this.checkInstance(key))
			this._resetEntity(key);
	}

	/**
	 * Delete all instances on the next loop
	 * @returns {Array} Array length = Number of Instances deleted
	 */
	_resetAll() {
		return Promise.all(
			Object.keys(this.instances).map(key => this._resetEntity(key))
		);
	}

	/**
	 * Delete an Entity
	 * @param {String} key Instance
	 * @returns {Promise}
	 */
	async _resetEntity(key) {
		this.instances[key].reset();
	}

	/**
	 * Manually iterates over the entire cache proactively pruning old entries
	 * @param {String} key Instance. Delete All by Default
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
	 * @param {String} key Entity
	 */
	_pruneEntity(key) {
		this.instances[key].prune();
	}
}

module.exports = MemoryManager;

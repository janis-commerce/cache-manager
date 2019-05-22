'use strict';

const async = require('async');
const md5 = require('md5');

const CacheNotifier = require('./notifier');
const RedisManager = require('./redis-manager');
const MemoryManager = require('./memory-manager');

const logger = coreRequire('./modules/logger');

const redis = Symbol('redis');
const memory = Symbol('memory');

/**
*	Cache Manager class - Singleton
*	@memberof Core
*/

class CacheManager {

	constructor() {

		CacheNotifier.on(CacheNotifier.events.CLEAR_ENTITY, async(entity, clientId) => {

			this.client = clientId ? { id: clientId } : null;

			const isClientCache = !!clientId;

			await this.memory(isClientCache).reset(entity);

			logger.info(`Cache for entity '${entity}' cleared! Client: ${clientId || 'all'}`);
		});

		CacheNotifier.on(CacheNotifier.events.CLEAR_ALL, async() => {

			await this.memory(false).reset();

			logger.info('Cache cleared!');
		});
	}

	initialize() {
		CacheNotifier.listen();
		RedisManager.initialize();
	}

	/**
	 * Gets the prefix.
	 *
	 * @param {boolean} isClientCache Indicates if client cache
	 * @return {string} The prefix.
	 */
	getKeyPrefix(isClientCache) {
		return isClientCache ? `${this.client}-` : '';
	}

	/**
	 * Validates if can use cache
	 *
	 * @param {boolean} isClientCache Indicates if requesting client cache
	 * @return {boolean} true if can use it, false otherwise
	 */
	validateClient(isClientCache) {

		if(isClientCache && !this.client)
			throw new Error('CacheManager - Cache for client without client logged');

		return true;
	}

	/**
	*	Get redis cache instance
	*	@return {object} RedisManager instance
	*/

	redis(isClientCache = true) {

		this.validateClient(isClientCache);

		if(!this[redis]) {
			this[redis] = RedisManager;
			this[redis].performance = this.performance;
		}

		this[redis].keyPrefix = this.getKeyPrefix(isClientCache);

		return this[redis];
	}

	/**
	 * Get a memory {@link https://github.com/isaacs/node-lru-cache LRU Cache} for a specific entity
	 *
	 * @param {boolean} isClientCache Determinates if client cache
	 * @return {object} MemoryManager instance
	 */

	memory(isClientCache = false) {

		this.validateClient(isClientCache);

		if(!this[memory]) {
			this[memory] = MemoryManager;
			this[memory].performance = this.performance;
		}

		this[memory].keyPrefix = this.getKeyPrefix(isClientCache);

		return this[memory];
	}

	/**
	 * Prepares the params, adding MS prefix
	 *
	 * @param {object} params The parameters
	 * @return {string} encoded parameters
	 */
	_prepareParams(params) {
		return md5(JSON.stringify({
			_MS: this.MS,
			...params
		}));
	}

	async fetch(entity, params = {}, isClientCache = false) {

		const newParams = this._prepareParams(params);

		let fetched = this.memory(isClientCache).get(entity, newParams); // no 'await' necesary

		if(typeof fetched !== 'undefined')
			return fetched;

		fetched = await this.redis(isClientCache).get(entity, newParams);

		if(fetched !== null) {
			// if memory no fetch but redis fetch, save memory
			this.memory(isClientCache).set(entity, fetched, newParams);
			return fetched;
		}

		return undefined;
	}

	save(entity, params, results, isClientCache = false) {

		const newParams = this._prepareParams(params);

		this.memory(isClientCache).set(entity, results, newParams);
		this.redis(isClientCache).set(entity, newParams, results);
	}

	/**
	*	Prune/Clear memory cache/s
	*	@param {string} [entity] - The cache of the entity that will be pruned. If empty all caches will be pruned
	*	@private
	*	@return {Promise}
    */

	_clean(entity, isClientCache, method) {

		return new Promise(resolve => {

			// Remove single cache
			if(entity) {

				entity = this.getNamespace(entity, isClientCache);

				return process.nextTick(() => {

					if(this[memory][entity] && this[memory][entity][method])
						this[memory][entity][method]();

					resolve();
				});

			}

			// Prune/Reset all caches
			// We run `method` on each cache in a different tick of the event loop,
			// since .prune/.reset is a synchronous operation, we don't want to loop through a big collection synchronously
			// blocking the event loop
			async.each(this[memory], (cache, callback) => {

				process.nextTick(() => {

					if(cache[method])
						cache[method]();

					callback();
				});

			}, resolve);

		});
	}

	/**
	*	Prune memory cache/s: Manually iterates over the entire cache proactively pruning old entries
	*	@param {string} [namespace] - The cache of the namespace that will be pruned. If empty all caches will be pruned
	*	@return {Promise}
	*/

	prune(namespace, isClientCache = false) {
		return this._clean(namespace, isClientCache, 'prune');
	}

	/**
	*	Reset memory cache/s
	*	@param {string} [namespace] - The cache of the namespace that will be cleared. If empty all caches will be cleared
	*	@return {Promise}
	*/

	reset(namespace, isClientCache = false) {
		return this._clean(namespace, isClientCache, 'reset');
	}

	close() {
		RedisManager.close();
	}


	get MS() {
		return process.env.MICROSERVICE || 'node';
	}

	get client() {
		return this._client;
	}

	set client(client) {
		this._client = client && client.id ? client.id : null;
	}
}

module.exports = new CacheManager();
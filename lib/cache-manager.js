/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

'use strict';

const logger = require('@janiscommerce/logger');
const path = require('path');
const CacheManagerError = require('./cache-manager-error');

const STR = {
	memory: {
		dependency: 'lru-cache',
		private: '_memory',
		route: './memory-manager'
	},
	redis: {
		dependency: 'redis',
		private: '_redis',
		route: './redis-manager'
	}
};

/**
 * CacheMAnager Class
 */

class CacheManager {

	set clientPrefix(clientPrefix) {
		this._clientPrefix = clientPrefix;
	}

	get clientPrefix() {
		return this._clientPrefix;
	}

	get memory() {
		this.init('_memory');
		return this._memory;
	}

	set memory(memo) {
		this._memory = memo;
	}

	get redis() {
		this.init('_redis');
		return this._redis;
	}

	set redis(red) {
		this._redis = red;
	}

	/**
   * Initialize CacheManager.
   * @param {string} clientPrefix Name of the clientPrefix-prefix
   */
	constructor(clientPrefix) {
		this.clientPrefix = this.validClientPrefix(clientPrefix);
		this.memory = null;
		this.redis = null;
		logger.info(`Cache - cliente prefix: ${this.clientPrefix}`);
	}

	/**
	 * Check the client-prefix
	 * @param {String} prefix name of client-prefix.
	 * @returns {String} client-prefix name.
	 */
	validClientPrefix(clientPrefix) {
		if(typeof clientPrefix !== 'string')
			throw new CacheManagerError('Invalid client-prefix.', CacheManagerError.codes.INVALID_PREFIX);
		return clientPrefix;
	}

	/**
	 * Initialize a strategy in case of null
	 * @param {String} strategy
	 */
	init(strategy) {
		if(this[strategy] === null) {
			if(this.checkDependency(strategy.substring(1)))
				this.initStrategy(strategy.substring(1));
		}
	}

	/**
	 * Initialize a strategy in case it is implemented
	 * @param {String} dependency
	 */
	initStrategy(dependency) {
		switch(dependency) {
			case 'redis': {
				try {
					const RedisManager = require(STR[dependency].route);
					this._redis = new RedisManager(this.clientPrefix);
					break;
				} catch(error) {
					throw new CacheManagerError('Module not found', CacheManagerError.codes.MODULE_NOT_FOUND);
				}
			}
			case 'memory': {
				try {
					const MemoryManager = require(STR[dependency].route);
					this._memory = new MemoryManager(this.clientPrefix);
					break;
				} catch(error) {
					throw new CacheManagerError('Module not found', CacheManagerError.codes.MODULE_NOT_FOUND);
				}
			}
			default:
				throw new CacheManagerError('Strategy not implemented', CacheManagerError.codes.INVALID_STRATEGY);
		}
	}

	/**
	 * Check if the dependency is installed
	 * @param {String} strategy
	 * @returns {Boolean}
	 */
	checkDependency(strategy) {
		try {
			return !!require(path.join(process.cwd(), 'node_modules', STR[strategy].dependency));
		} catch(err) {
			throw new CacheManagerError(`Dependency not installed: ${strategy}`, CacheManagerError.codes.DEPENDENCY_NOT_FOUND);
		}
	}

	/**
   * Save date All strategies.
   * @param {string} entity Entity name
   * @param {string} params Parametres
   * @param {*} results Values to be saved
   */
	save(entity, params, results) {
		Object.keys(STR).forEach(async strategy => {
			this[strategy].set(entity, params, results);
		});
	}

	/**
   * Fetched data,in the fastest strategy.
   * @param {string} entity Entity
   * @param {string} params Parametres
   * @param {*} results Values
   */
	async fetch(entity, params) {
		let fetched;
		const strs = Object.values(STR);

		for(const strategy of strs) {
			if(this[strategy.private] === null)
				throw new CacheManagerError(`Uninitialized strategy: ${strategy.private.substring(1)}`, CacheManagerError.codes.UNINITIALIZED_STRATEGY);

			fetched = await this[strategy.private.substring(1)].get(entity, params);

			if(typeof fetched !== 'undefined' && fetched !== null) {
				logger.info(`Cache - Found in ${strategy.private.substring(1)}`);
				if(strategy.private !== '_memory' && this[strategy.private] !== null)
					this.memory.set(entity, params, fetched);
				break;
			}
		}
		return fetched;
	}

	/**
   * Reset cache memorys in all strategies
   * @param {string} entity Entity
   */
	async reset(key = null) {
		if(key)
			return this._resetEntity(key);

		return this._cleanAll('reset');
	}

	/**
	 * Reset entity in all strategies
	 * @param {String} entity Entity
	 */
	async _resetEntity(entity) {
		await this.cleanEntity(entity, 'reset');
	}

	/**
   * Clean the memory in every strategy avaible.
   * @param {string} entity Entity
   * @param {string} method Method to clean ('reset' or 'prune')
   */
	async _cleanAll(method) {
		Object.keys(STR).forEach(async strategy => {
			await this[strategy][method]();
		});
	}

	/**
   * Clean only the entity from the cache
   * @param {string} entity Entity
   * @param {string} method Method to clean ('reset')
   */
	async cleanEntity(entity, method) {
		Object.keys(STR).forEach(async strategy => {
			await this[strategy][method](entity);
		});
	}
}

module.exports = CacheManager;

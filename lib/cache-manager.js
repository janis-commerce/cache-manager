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
 * CacheManager Class
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
   * @param {String} clientPrefix Name of the clientPrefix-prefix
   */
	constructor(clientPrefix) {
		this.clientPrefix = this.validateClientPrefix(clientPrefix);
		this.memory = null;
		this.redis = null;
		logger.info(`Cache - client prefix: ${this.clientPrefix}`);
	}

	/**
	 * Check the client-prefix
	 * @param {String} prefix name of client-prefix.
	 * @returns {String} client-prefix name.
	 */
	validateClientPrefix(clientPrefix) {
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
					throw new CacheManagerError(`Module not found: ${STR[dependency].dependency}`, CacheManagerError.codes.MODULE_NOT_FOUND);
				}
			}
			case 'memory': {
				try {
					const MemoryManager = require(STR[dependency].route);
					this._memory = new MemoryManager(this.clientPrefix);
					break;
				} catch(error) {
					throw new CacheManagerError(`Module not found: ${STR[dependency].dependency}`, CacheManagerError.codes.MODULE_NOT_FOUND);
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
			throw new CacheManagerError(`Dependency not installed for ${strategy} strategy`, CacheManagerError.codes.DEPENDENCY_NOT_FOUND);
		}
	}

	/**
   * Save date All strategies.
   * @param {String} entity Entity name
   * @param {String} params Parametres
   * @param {*} results Values to be saved
   */
	async save(entity, params, results) {
		for(const strategy of Object.keys(STR)) {
			try {
				await this[strategy].set(entity, params, results);
			} catch(error) {
				throw new CacheManagerError('Error when saving', CacheManagerError.codes.UNSAVED_DATA);
			}
		}
	}

	/**
   * Fetched data,in the fastest strategy.
   * @param {String} entity Entity
   * @param {String} params Parametres
   * @param {*} results Values
   */
	async fetch(entity, params) {
		let fetched;
		const strs = Object.values(STR);

		for(const strategy of strs) {
			if(this[strategy.private] === null)
				throw new CacheManagerError(`Uninitialized strategy: ${strategy.private.substring(1)}`, CacheManagerError.codes.UNINITIALIZED_STRATEGY);

			try {
				fetched = await this[strategy.private.substring(1)].get(entity, params);
			} catch(error) {
				throw new CacheManagerError('Error getting data', CacheManagerError.codes.ERROR_GET_DATA);
			}

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
   * @param {String} entity Entity
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
	_resetEntity(entity) {
		this._cleanEntity(entity, 'reset');
	}

	/**
   * Clean the memory in every strategy avaible.
   * @param {String} entity Entity
   * @param {String} method Method to clean ('reset' or 'prune')
   */
	async _cleanAll(method) {
		for(const strategy of Object.keys(STR)) {
			try {
				await this[strategy][method]();
			} catch(error) {
				throw new CacheManagerError('', CacheManagerError.codes.WITHOUT_RESETTING);
			}
		}
	}

	/**
   * Clean only the entity from the cache
   * @param {String} entity Entity
   * @param {String} method Method to clean ('reset')
   */
	async _cleanEntity(entity, method) {
		for(const strategy of Object.keys(STR)) {
			try {
				await this[strategy][method](entity);
			} catch(error) {
				throw new CacheManagerError('Failed to reset all data in each strategy', CacheManagerError.codes.WITHOUT_RESETTING);
			}
		}
	}
}

module.exports = CacheManager;

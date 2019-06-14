/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-case-declarations */
/* eslint-disable global-require */

'use strict';

const logger = require('@janiscommerce/logger');
const path = require('path');
const CacheManagerError = require('./cache-manager-error');

class CacheManager {
	set client(client) {
		this._client = client;
	}

	get client() {
		return this._client;
	}

	get memory() {
		return this.use('_memory');
	}

	get redis() {
		return this.use('_redis');
	}

	set memory(memory) {
		this._memory = memory;
	}

	set redis(redis) {
		this._redis = redis;
	}

	get strategies() {
		const str =
		{
			_memory: {
				dependency: 'lru-cache',
				init: client => {
					try {
						const MemoryManager = require('./memory-manager.js');
						this.memory = new MemoryManager(client);
					} catch(error) {
						throw new Error(error.message);
					}
				}
 			},
			_redis: {
				dependency: 'redis',
				init: client => {
					try {
						const RedisManager = require('./redis-manager.js');
						this.redis = new RedisManager(client);

					} catch(error) {
						throw new Error(error.message);
					}
				}
			}
		};

		return str;
	}

	/**
   * Initialize All the Strategies.
   * @param {string} client Name of the Client
   */
	constructor(client) {
		this.client = this.validClientPrefix(client);
		this._memory = null;
		this._redis = null;
		logger.info(`Cache Manager - Client: ${this.client}`);
	}

	/**
	 *
	 * @param {String} client name of client.
	 * @returns {String} client name.
	 */
	validClientPrefix(clientPrefix) {
		if(typeof clientPrefix !== 'string')
			throw new CacheManagerError('Invalid client-prefix.', CacheManagerError.codes.INVALID_PREFIX);
		return clientPrefix;
	}


	use(strategy) {

		if(this[strategy] === null) {
			this.checkDependency(strategy);
			this.initStrategy(strategy);
			this[strategy].inited = true;
		}
		return this[strategy];
	}

	/**
   * Save date All strategies.
   * @param {string} entity Entity name
   * @param {string} params Parametres
   * @param {*} results Values to be saved
   */
	save(entity, params, results) {

		Object.keys(this.strategies).forEach(strategy => {
			if(this.checkDependency(strategy)) {
				if(this[strategy])
					this[strategy].set(entity, params, results);
				else {
					this.initStrategy(strategy);
					this[strategy].set(entity, params, results);
				}
			}
		});

	}

	initStrategy(dependency) {

		try {
			this.strategies[dependency].init(this.client);
		} catch(error) {
			throw new Error(`estrategia no implementada ${dependency}`);
		}

		/* console.log('-----INIT STRATEGY: ', dependency);
		switch(dependency) {
			case '_redis':
				const RedisManager = require('./redis-manager');
				this._redis = new RedisManager(this.client);
				break;
			case '_memory':
				const MemoryManager = require('./memory-manager');
				this._memory = new MemoryManager(this.client);
				break;
			default:
				throw new Error('estrategia no implementada');
		} */
	}

	checkDependency(strategy) {
		try {
			// eslint-disable-next-line global-require
			return !!require(path.join(process.cwd(), 'node_modules', this.getDependency(strategy)));
		} catch(err) {
			throw new Error(`estrategia no instalada: ${this.getDependency(strategy)}`);
		}
	}

	getDependency(strategy) {
		const str = this.strategies[strategy].dependency;
		return str;
	}

	/**
   * Fetched data,in the fastest strategy.
   * @param {string} entity Entity
   * @param {string} params Parametres
   * @param {any} results Values
   */
	async fetch(entity, params) {

		let fetched;
		const strs = Object.keys(this.strategies);

		for(const strategy of strs) {
			if(this[strategy] !== null && this[strategy].inited)
				fetched = await this[strategy].get(entity, params);

			if(typeof fetched !== 'undefined' && fetched !== null) {
				logger.info(`Cache - Found in ${strategy}`);

				if(this.memory === null)
					console.log(this.memory);
				// strategy !== 'memory' && this.memory !== null
					// this.memory.set(entity, params, fetched);

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
		Object.keys(this.strategies).forEach(async strategy => {
			if(this[strategy] !== null)
				await this[strategy][method]();
		});
	}

	/**
   * Clean only the entity from the cache
   * @param {string} entity Entity
   * @param {string} method Method to clean ('reset')
   */
	async cleanEntity(entity, method) {
		Object.keys(this.strategies).forEach(async strategy => {
			if(this[strategy] !== null)
				await this[strategy][method](entity);
		});
	}
}

module.exports = CacheManager;

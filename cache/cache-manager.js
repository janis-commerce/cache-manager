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

	get strategies() {
		const str =
		{
			memory: {
				dependency: 'lru-cache',
				init: () => {
					const RedisManager = require('./redis-manager');
					this.redis = new RedisManager(this.client);
				}
 			},
			redis: {
				dependency: 'redis',
				init: () => {
					const RedisManager = require('./redis-manager');
					this.redis = new RedisManager(this.client);
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
		/* if(this.client)
			return; */

		this.client = this.validClientPrefix(client);

		this.memory = null;
		this.redis = null;
		// Clean before start using.
		/* MemoryManager.reset();
		RedisManager.reset(); */
		logger.info(`Cache Manager - Client: ${this.client}`);
	}

	/**
	 *
	 * @param {String} client name of client.
	 * @returns {String} client name.
	 */
	validClientPrefix(clientPrefix) {
		if(typeof clientPrefix !== 'string')
			throw new CacheManagerError('Invalid client-prefix.', CacheManagerError.codes.MISSING_PARAMETRES);
		return clientPrefix;
	}

	get _memory() {
		return this.use('memory');
	}

	get _redis() {
		return this.use('redis');
	}

	use(strategy) {

		if(this[strategy] === null) {
			this.checkDependency(strategy);
			this.initStrategy(strategy);
		}

		return this[strategy];

		/* if(!this[strategy]) {
				const MemoryManager = require('./memory-manager');
				this[strategy] = new MemoryManager(this.client);
				return this[strategy];
			} */

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

		/* try {
			this.strategies[dependency].init();
		} catch(error) {
			throw new Error('estrategia no implementada');
		} */

		console.log('-----INIT STRATEGY: ', dependency);
		switch(dependency) {
			case 'redis':
				const RedisManager = require('./redis-manager');
				this.redis = new RedisManager(this.client);
				break;
			case 'memory':
				const MemoryManager = require('./memory-manager');
				this.memory = new MemoryManager(this.client);
				break;
			default:
				throw new Error('estrategia no implementada');
		}
	}

	checkDependency(strategy) {
		const str = strategy === 'memory' ? 'lru-cache' : strategy;
		try {
			// eslint-disable-next-line global-require
			return !!require(path.join(process.cwd(), 'node_modules', str));
		} catch(err) {
			throw new Error(`estrategia no instalada: ${strategy}`);
		}
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
			if(this[strategy] !== null) {
				fetched = await this
					.use(strategy)
					.get(entity, params);
			}

			if(typeof fetched !== 'undefined' && fetched !== null) {
				logger.info(`Cache - Found in ${strategy}`);

				if(strategy !== 'memory' && this.memory !== null)
					this.use('memory').set(entity, params, fetched);

				break;
			}
		}

		return fetched;

		/* STRATEGIES.every(async strategy => {

			fetched = await this.use(strategy).get(entity, params);
			// console.log('resultado fetched: ', fetched, strategy);

			if(fetched || typeof fetched !== 'undefined') {
				// console.log(fetched, strategy);
				logger.info(`Cache - Found in ${strategy}`);

			}
		});

		return fetched || null; */


		// Search in Memory (LRU) first
		/* let fetched = await this.memory.get(entity, params);

		if(typeof fetched !== 'undefined') {
			logger.info('Cache - Found in memory.');
			return fetched;
		} */

		// If in the memory not Found, search in Redis
		/* const fetched = await this.redis.get(entity, params);

		if(fetched !== null) {
			logger.info('Cache - Found in Redis.');
			this.memory.set(entity, params, fetched);
			return fetched;
		}

		logger.info('Cache - not found.'); */

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

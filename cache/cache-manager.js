/* eslint-disable import/no-dynamic-require */

'use strict';

const logger = require('@janiscommerce/logger');
const path = require('path');

const STRATEGIES = ['memory', 'redis'];

class CacheManager {
	set client(client) {
		this._client = client;
	}

	get client() {
		return this._client;
	}

	/**
   * Initialize All the Strategies.
   * @param {string} client Name of the Client
   */
	constructor(client) {
		/* if(this.client)
			return; */

		this.client = this.validClient(client);

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
	validClient(client) {
		if(typeof client === 'string')
			return client;
		return 'DEFAULT_CLIENT';
	}

	use(strategy) {

		if(this[strategy] === null) {

			this.checkDependency(strategy);
			this.initStrategy(strategy);

			/* if(!this[strategy]) {
				const MemoryManager = require('./memory-manager');
				this[strategy] = new MemoryManager(this.client);
				return this[strategy];
			} */
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
		STRATEGIES.forEach(strategy => {
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
		console.log('-----INIT STRATEGY: ', dependency);
		switch(dependency) {
			case 'redis':
				// eslint-disable-next-line no-case-declarations
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
   * @param {*} results Values
   */
	async fetch(entity, params) {

		let fetched;

		for(const strategy of STRATEGIES) {
			fetched = await this.use(strategy).get(entity, params);

			if(typeof fetched !== 'undefined' && fetched !== null) {
				logger.info(`Cache - Found in ${strategy}`);

				if(strategy !== 'memory')
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
		STRATEGIES.forEach(async strategy => {
			await this[strategy][method]();
		});
	}

	/**
   * Clean only the entity from the cache
   * @param {string} entity Entity
   * @param {string} method Method to clean ('reset')
   */
	async cleanEntity(entity, method) {
		STRATEGIES.forEach(async strategy => {
			await this[strategy][method](entity);
		});
	}
}

module.exports = CacheManager;

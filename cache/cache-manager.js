'use strict';

const logger = require('@janiscommerce/logger');
const RedisManager = require('./redis-manager');
const MemoryManager = require('./memory-manager');
const path = require('path')

const STRATEGIES = ['redis'];

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

	/**
   * Returns Memory Manager. Needs to be intialized.
   */
	/* get memory() {
		return this.memory;
	} */

	/**
   * Returns Redis Manager. Needs to be intialized.
   */
	/* get redis() {
		return this.redis;
	} */



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
			}
		});
	}

	initDependency(dependency){
		this[dependency] = 
	}

	checkDependency(dependency) {
		try {
			// eslint-disable-next-line global-require
			return !!require(path.join(process.cwd(), 'node_modules', dependency));
		} catch(err) {
			throw new Error('dependencia no instalada');
		}
	}

	/**
   * Fetched data,in the fastest strategy.
   * @param {string} entity Entity
   * @param {string} params Parametres
   * @param {*} results Values
   */
	async fetch(entity, params) {

		// Search in Memory (LRU) first
		let fetched = await this.memory.get(entity, params);

		if(typeof fetched !== 'undefined') {
			logger.info('Cache - Found in memory.');
			return fetched;
		}

		// If in the memory not Found, search in Redis
		fetched = await this.redis.get(entity, params);

		if(fetched !== null) {
			logger.info('Cache - Found in Redis.');
			this.memory.set(entity, params, fetched);
			return fetched;
		}

		logger.info('Cache - not found.');

		return null;
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

'use strict';

const logger = require('@janiscommerce/logger');

const RedisManager = require('./redis-manager');
const MemoryManager = require('./memory-manager');

const STRATEGIES = ['memory', 'redis'];

class CacheManager {
	static set client(client) {
		this._client = client;
	}

	static get client() {
		return this._client;
	}

	/**
   * Initialize All the Strategies.
   * @param {string} client Name of the Client
   */
	static initialize(client) {
		if(this.client)
			return;

		this.client = client;

		MemoryManager.initialize(this.client);
		RedisManager.initialize(this.client);
		// Clean before start using.
		MemoryManager.reset();
		RedisManager.reset();

	}

	/**
   * Returns Memory Manager. Needs to be intialized.
   */
	static get memory() {
		return MemoryManager;
	}

	/**
   * Returns Redis Manager. Needs to be intialized.
   */
	static get redis() {
		return RedisManager;
	}

	/**
   * Save date All strategies.
   * @param {string} entity Entity name
   * @param {string} params Parametres
   * @param {*} results Values to be saved
   */
	static save(entity, params, results) {
		this.memory.set(entity, params, results);
		this.redis.set(entity, params, results);
	}

	/**
   * Fetched data,in the fastest strategy.
   * @param {string} entity Entity
   * @param {string} params Parametres
   * @param {*} results Values
   */
	static async fetch(entity, params, results) {
		// Search in Memory (LRU) first

		let fetched = await this.memory.get(entity, params, results);

		if(typeof fetched !== 'undefined') {
			logger.info('Cache - Found in memory.');
			return fetched;
		}

		// If in the memory not Found, search in Redis

		fetched = await this.redis.get(entity, params, results);

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
	static async reset(key = null) {

		if(key) 
			return this.resetEntity(key);		

		return this.cleanAll('reset');
	}

	/**
   * Clean the memory in every strategy avaible.
   * @param {string} entity Entity
   * @param {string} method Method to clean ('reset' or 'prune')
   */
	static async cleanAll(method) {
		STRATEGIES.forEach(async strategy => {
			console.log('entro a borrar');

			await this[strategy][method]();
		});
	}

	/**
	 * Reset entity in all strategies
	 * @param {String} entity Entity
	 */
	static async resetEntity(entity) {
		await this.cleanEntity(entity, 'reset');
	}

	/**
   * Clean only the entity from the cache
   * @param {string} entity Entity
   * @param {string} method Method to clean ('reset')
   */
	static async cleanEntity(entity, method) {
		STRATEGIES.forEach(async strategy => {
			await this[strategy][method](entity);
		});
	}

}

module.exports = CacheManager;

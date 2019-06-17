'use strict';

const logger = require('@janiscommerce/logger');
const RedisManager = require('./redis-manager');
const MemoryManager = require('./memory-manager');

const STRATEGIES = ['memory', 'redis'];

const STR = {
	memory: {
		dependency: 'lru-cache',
		var: '_memory'
	},
	redis: {
		dependency: 'redis',
		var: '_redis'
	}
};

class CacheManager {
	set client(client) {
		this._client = client;
	}

	get client() {
		return this._client;
	}

	get memory() {
		if(this._memory === null) {
			console.log('memoria en nulo, iniciando');
			this._memory = new MemoryManager(this.client);
		}
		return this._memory;
	}

	set memory(memo) {
		this._memory = memo;
	}

	get redis() {
		if(this._redis === null) {
			console.log('redis en nulo, iniciando');
			this._redis = new RedisManager(this.client);
		}

		return this._redis;
	}

	set redis(red) {
		this._redis = red;
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
		logger.info(`Cache - cliente prefix: ${this.client}`);
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
		this.memory.set(entity, params, results);
		this.redis.set(entity, params, results);
	}

	isInit(strategy) {
		if(this[strategy] === null)
			return false;
		return true;
	}

	/**
   * Fetched data,in the fastest strategy.
   * @param {string} entity Entity
   * @param {string} params Parametres
   * @param {*} results Values
   */

	delKey(string) {
		const s = string.substring(1);
		return s;
	}

	async fetch(entity, params) {

		let fetched;
		const strs = Object.values(STR);

		for(const strategy of strs)
			/* const variable = strategy.var;
			console.log(variable); */
			// const varP = strategy.var;
			if(this[strategy.var] === null) {
				console.log(`${strategy.var} sin iniciar`)
				throw new Error(`${this.delKey(strategy.var)} no iniciada`);
			}else{
				console.log(`${strategy.var} iniciada`)
				fetched = await this[this.delKey(strategy.var)].get(entity, params)
				break;
			}
			

		// console.log(`${strategy} sin iniciar`)
		/* if(this[strategy] !== null && this[strategy].inited)
				fetched = await this[strategy].get(entity, params);

			if(typeof fetched !== 'undefined' && fetched !== null) {
				logger.info(`Cache - Found in ${strategy}`);

				if(this.memory === null) {
					console.log(this.memory);
					strategy !== 'memory' && this.memory !== null;
					this.memory.set(entity, params, fetched);
				}
				break;
			} */


		return fetched;

		// Search in Memory (LRU) first
		/* let fetched = await this.memory.get(entity, params);

		if(typeof fetched !== 'undefined') {
			logger.info('Cache - Found in memory.');
			return fetched;
		} */

		// If in the memory not Found, search in Redis
		/* fetched = await this.redis.get(entity, params);

		if(fetched !== null) {
			logger.info('Cache - Found in Redis.');
			this.memory.set(entity, params, fetched);
			return fetched;
		}

		logger.info('Cache - not found.');

		return null; */
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

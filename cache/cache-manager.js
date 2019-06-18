/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

'use strict';

const logger = require('@janiscommerce/logger');
const path = require('path');

const STRATEGIES = ['memory', 'redis'];

const STR = {
	memory: {
		dependency: 'lru-cache',
		var: '_memory',
		init: client => {
			try {
				const MemoryManager = require('./memory-manager.js');
				this._memory = new MemoryManager(client);
			} catch(error) {
				throw new Error(error.message);
			}
		}
	},
	redis: {
		dependency: 'redis',
		var: '_redis',
		init: client => {
			try {
				const RedisManager = require('./redis-manager.js');
				this._redis = new RedisManager(client);

			} catch(error) {
				throw new Error(error.message);
			}
		}
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
		this.init('memory');
		return this._memory;
	}

	set memory(memo) {
		this._memory = memo;
	}

	get redis() {
		this.init('redis');
		return this._redis;
	}

	init(strategy) {
		if (this._redis === null) {
			if (this.checkDependency(strategy))
				this.initStrategy(strategy);
		}
	}

	set redis(red) {
		this._redis = red;
	}

	initStrategy(dependency) {
		console.log(STR[dependency].var);

		/* try {
			STR[dependency].init(this.client);
		} catch(error) {
			throw new Error(`estrategia no implementada ${dependency}`);
		} */

		console.log('-----INIT STRATEGY: ', dependency);
		switch(dependency) {
			case 'redis': {
				try {
					const RedisManager = require('./redis-manager');
					this._redis = new RedisManager(this.client);
					break;
				} catch(error) {
					throw new Error(error);
				}
			}
			case 'memory': {
				try {
					const MemoryManager = require('./memory-manager');
					this._memory = new MemoryManager(this.client);
					break;
				} catch(error) {
					throw new Error(error);
				}

			}
			default:
				throw new Error('estrategia no implementada');
		}
	}

	checkDependency(strategy) {
		try {
			return !!require(path.join(process.cwd(), 'node_modules', this.getDependency(strategy)));
		} catch(err) {
			throw new Error(`estrategia no instalada: ${this.getDependency(strategy)}`);
		}
	}

	getDependency(strategy) {
		const str = STR[strategy].dependency;
		return str;
	}


	/**
   * Initialize All the Strategies.
   * @param {string} client Name of the Client
   */
	constructor(client) {
		this.client = this.validClient(client);
		this.memory = null;
		this.redis = null;
		logger.info(`Cache - cliente prefix: ${this.client}`);
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

		for(const strategy of strs) {
			if(this[strategy.var] === null) {
				console.log(`${strategy.var} sin iniciar`);
				throw new Error(`Estrategia ${this.delKey(strategy.var)} no iniciada`);
			}
			fetched = await this[this.delKey(strategy.var)].get(entity, params);

			if(typeof fetched !== 'undefined' && fetched !== null) {
				logger.info(`Cache - Found in ${strategy}`);
				break;
			}
		}

		return fetched;


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
		const strategies = Object.keys(STR)
		strategies.forEach(async strategy => {
			await this[strategy][method]();
		});
	}

	/**
   * Clean only the entity from the cache
   * @param {string} entity Entity
   * @param {string} method Method to clean ('reset')
   */
	async cleanEntity(entity, method) {
		const strategies = Object.keys(STR)
		strategies.forEach(async strategy => {
			await this[strategy][method](entity);
		});
	}
}

module.exports = CacheManager;

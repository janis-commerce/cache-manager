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

	static initialize(client) {    

		if(this.client)
			return ;

		this.client = client;
		// Inicializa
		MemoryManager.iniciar(this.client);
		RedisManager.initialize(this.client);
		// Y limpia para empezar de 0
		MemoryManager.reset();
		RedisManager.reset();

		logger.info(`Cache cleared! Client: ${this.client || 'all'}`);
	}

	static get memory() {
		return MemoryManager;
	}

	static get redis() {
		return RedisManager;
	}

	static save(entity, params, results) {

		this.memory.set(entity, params, results);
		this.redis.set(entity, params, results);
	}

	static async fetch(entity, params, results) {

		// Busco primero en memoria

		let fetched = this.memory.get(entity, params, results);

		if(typeof fetched !== 'undefined') {
			logger.info('Cache - Found in memory.');
			return fetched;
		}

		// Busco en Redis

		fetched = await this.redis.get(entity, params, results);

		if(fetched !== null) {
			// Si existe, carga en memoria
			logger.info('Cache - Found in redis.');
			this.memory.set(entity, params, results);
			return fetched;
		}
		// si no existe retorna null
		return null;

	}

	static async _clean(entity, method) {
		STRATEGIES.forEach(async strategy => {
			await this[strategy][method](entity);
		});
	}

	static async prune(namespace) {
		await this._clean(namespace, 'prune');
	}

	static async reset(namespace) {
		await this._clean(namespace, 'reset');
	}

	static close() {
		RedisManager.close();
	}

}

module.exports = CacheManager;

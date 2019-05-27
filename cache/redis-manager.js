'use strict';

const { promisify } = require('util');
const redis = require('redis');
const md5 = require('md5');

const logger = require('@janiscommerce/logger');
const config = require('../config/redis.json');

/**
*    RedisManager class - Singleton
*/

class RedisManager {

	static set keyPrefix(prefix) {
		this._keyPrefix = prefix;
	}

	static get keyPrefix() {
		return this._keyPrefix;
	}

	static _getKey(key) {
		return `${this.keyPrefix}${key}`;
	}

	/* Prepares the params, adding MS prefix     *
    * @param {object} params The parameters
    * @return {string} encoded parameters
    */
	static _prepareParams(params) {
		return md5(JSON.stringify({
			_MS: this.MS,
			...params
		}));
	}


	static initialize(prefix) {

		this.keyPrefix = prefix;

		this.clients = [];
		this.inited = false;

		// Si estaba inicializado, borra todo y cargar el nuevo cliente
		if(this.client)
			this.reset();


		this.client = this.createClient();

		this.promisify(this.client);
	}

	/**
     *    Create a redis client
     *    @param {object} options - Redis client options
     *    @param {boolean} [promise=true] - Whether to promisify methods or not. There are cases where we need an unmodified client (IE: to pass to socket.io adapter)
     *    @return {object} redis client
     */
	static createClient(options = {}) {
		const host = config.host || 'localhost';
		const port = config.port || 6379;

		const defaults = {
			host,
			port,
			retry_strategy: data => {
				if(!this.inited)
					return 5000; // If it never inited retry every 5 seconds.

				return Math.min(data.total_retry_time || 1000, 30 * 1000); // Max retry of 30 seconds
			}
		};

		const client = redis.createClient({ ...defaults, ...options });

		client.on('connect', () => {
			logger.info(`Redis - connected to ${host}:${port}`);
			this.inited = true;
		});

		client.on('error', err => logger.error(err.message));

		this.clients.push(client); // for close latter

		return client;
	}

	/**
     *    Promisify redis methods
     *    @param {object} client - Redis client
     *    @param {object} redis client
     */
	static promisify() {

		const methods = ['hset', 'hget', 'hdel', 'del', 'flushall']; // Add more methods if needed

		for(const method of methods)
			this.client[method] = promisify(this.client[method]);
	}

	static async set(key, subkey, value) {
		// Si no existen datos para guardar manda error.
		if(!key || !subkey || !value)
			throw new Error('SET - Missing parametres.');

		// Guarda
		await this.client.hset(this._getKey(key), this._prepareParams(subkey), JSON.stringify(value));
	}

	static async get(key, subkey) {
		if(!key || !subkey) {
			logger.error('Redis - No Search. Missing Parametres');
			throw new Error('GET - Missing Parametres.');
		}
		const value = await this.client.hget(this._getKey(key), this._prepareParams(subkey));
		return value ? JSON.parse(value) : null;
	}
	/**
     * Borra un Registro Individual
     * @param {String} key Entidad
     * @param {String} subkey Registro
     */

	static async resetOne(key, subkey) {
		await this.client.hdel(this._getKey(key), subkey);
	}

	/**
     * Borra toda una entidad y sus Registros
     * @param {String} key Entidad
     */

	static async resetEntity(key) {
		await this.client.del(this._getKey(key));
	}

	/**
     * Borra Todos las Entidades con sus registros.
     */

	static async resetAll() {
		await this.client.flushall('ASYNC');
	}

	/**
     * Borra los valores guardados en memoria
     *@param {*} key Entidad
     *@param {*} subkey Registro
     */

	static async reset(key, subkey = null) {

		if(!key)
			await this.resetAll();
		else if(subkey)
			await this.resetOne(key, subkey);
		else
			await this.resetEntity(key);
	}

	static close() {
		return Promise.all(this.clients.map(client => {
			const promise = new Promise(resolve => client.on('end', resolve));

			client.quit();

			return promise;
		}));
	}
}

module.exports = RedisManager;

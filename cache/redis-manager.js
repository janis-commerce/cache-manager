'use strict';

const { promisify } = require('util');
const md5 = require('md5');
const path = require('path');
const logger = require('@janiscommerce/logger');
const redis = require('redis');

/**
*    RedisManager class - Static
*/
class RedisManager {

	/**
     * Get the Redis Config JSON path
     */
	static get configPath() {

		return path.join(process.cwd(), 'config/redis.json');
	}

	/**
     * Cache the Redis config.
	* @param {String} route Config JSON path
     */
	static cacheConfig(pathconfig) {

		const pathconfigs = pathconfig || this.configPath;

		let config;

		try {
			// eslint-disable-next-line import/no-dynamic-require
			config = require(pathconfigs);
		} catch(error) {
			throw new Error('Invalid config path');
		}

		this._config = config;
	}

	/**
     * Get the Redis config
     * @return {object}
     */
	static get config() {
		if(!this._config)
			this.cacheConfig();

		return this._config;
	}

	static set keyPrefix(prefix) {
		this._keyPrefix = prefix;
	}

	static get keyPrefix() {
		return this._keyPrefix;
	}

	static _getKey(key) {
		return `${this.keyPrefix}${key}`;
	}

	/**
     * Prepares the params, adding MS prefix     *
    * @param {object} params The parameters
    * @return {String} encoded parameters
    */
	static _prepareParams(params) {
		return md5(JSON.stringify({
			_MS: this.MS,
			...params
		}));
	}

	/**
     * Initialize a Redis Client in order to be ready to use.
     * @param {String} client Name of the Client.
     */
	static initialize(client) {

		if(this.client)
			return;

		this.keyPrefix = client;
		this.clients = [];
		this.inited = null;

		this.client = this.createClient();
		this.promisify(this.client);
	}

	/**
     *    Create a redis client
     *    @param {object} options - Redis client options
     *    @return {object} redis client
     */
	static createClient(options = {}) {
		const host = this.config.host || 'localhost';
		const port = this.config.port || 6379;

		const defaults = {
			host,
			port
			/* retry_strategy: data => {
				if(!this.inited)
					return 5000; // If it never inited retry every 5 seconds.

				return Math.min(data.total_retry_time || 1000, 30 * 1000); // Max retry of 30 seconds
			} */
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
     */
	static promisify() {

		const methods = ['hset', 'hget', 'hdel', 'del', 'flushall']; // Add more methods if needed

		for(const method of methods)
			this.client[method] = promisify(this.client[method]);
	}

	/**
     * Save the data.
     *@param {*} key Entity name
     *@param {*} subkey Parametres, will be encryptic
     *@param {*} value Results
     */
	static async set(key, subkey, value) {
		// If there are no data to save throws Error
		if(!key || !subkey || !value)
			throw new Error('SET - Missing parametres.');

		const newParams = this._prepareParams(subkey); // Encrypt params
		await this.client.hset(this._getKey(key), newParams, JSON.stringify(value));
	}

	/**
     * Search the data
     * @param {String} key Entity
     * @param {params} subkey Parametres, will be encryptic
     */
	static async get(key, subkey) {
		// If no data to search throws Error
		if(!key || !subkey)
			throw new Error('GET - Missing Parametres.');

		const value = await this.client.hget(this._getKey(key), this._prepareParams(subkey));
		return value ? JSON.parse(value) : null;
	}

	/**
	 *
	 * @param {String} key
	 */
	static async reset(key = null) {
		if(!key) // No Key, Delete All
			await this.resetAll();
		else // If only have key, Delete Entity
			await this.resetEntity(key);
	}

	/**
     * Delete an Entity and all its registries
     * @param {String} key Entity
     */
	static async resetEntity(key) {
		await this.client.del(this._getKey(key));
	}

	/**
	* Delete all entities.
	*/
	static async resetAll() {
		await this.client.flushall('ASYNC');
	}

	/**
	* Delete values in memory
	*@param {*} key Entity
	*@param {*} subkey Parametres
	*/

	/**
     * Close connection
     */
	static close() {
		return Promise.all(this.clients.map(client => {
			const promise = new Promise(resolve => client.on('end', resolve));

			client.quit();

			return promise;
		}));
	}
}

module.exports = RedisManager;

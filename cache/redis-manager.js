'use strict';

const { promisify } = require('util');
const md5 = require('md5');
const path = require('path');
const logger = require('@janiscommerce/logger');
const redis = require('redis');
const CacheManagerError = require('./cache-manager-error');

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
	static cacheConfig() {

		let config;

		try {
			// eslint-disable-next-line global-require
			config = require(this.configPath);
		} catch(error) {
			throw new CacheManagerError('Invalid config path', CacheManagerError.codes.CONFIG_NOT_FOUND);
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

	static getKey(key) {
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

		this.keyPrefix = this.validClient(client);
		this.clients = [];
		this.inited = null;

		this.client = this.createClient();
		this.promisify(this.client);
	}

	static validClient(client) {
		if(typeof client === 'string')
			return client;
		return 'DEFAULT_CLIENT';
	}

	/**
     *    Create a redis client
     *    @param {object} options - Redis client options
     *    @return {object} redis client
     */
	static createClient(options = {}) {
		const { host, port } = RedisManager.configServer();

		const defaults = {
			host,
			port
		};

		const client = this.clientRedis(defaults, options);

		client.on('connect', () => {
			logger.info(`Redis - connected to ${host}:${port} - Client: ${this.keyPrefix}`);
			this.inited = true;
		});

		client.on('error', err => logger.error(err.message));

		client.on('reconnecting', () => {
			logger.warn(`Redis - reconnecting - Client: ${this.keyPrefix}`);
		});

		this.clients.push(client); // for close latter

		return client;
	}

	static configServer() {
		const host = this.config.host || 'localhost';
		const port = this.config.port || 6739;
		return { host, port };
	}

	/**
	 * @param {Object} defaults configs
	 * @param {Object} options properties
	 */
	static clientRedis(defaults, options) {
		return redis.createClient({ ...defaults, ...options });
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
     *@param {String} key Entity name
     *@param {String} subkey Parametres, will be encryptic
     *@param {*} value Results
     */
	static async set(key, subkey, value) {
		// If there are no data to save throws Error
		if(!key || !subkey || !value)
			throw new CacheManagerError('SET - Missing parametres.', CacheManagerError.codes.MISSING_PARAMETRES);

		const newParams = this._prepareParams(subkey); // Encrypt params
		await this.client.hset(this.getKey(key), newParams, JSON.stringify(value));
	}

	/**
     * Search the data
     * @param {String} key Entity
     * @param {params} subkey Parametres, will be encryptic
     */
	static async get(key, subkey) {
		// If no data to search throws Error
		if(!key || !subkey)
			throw new CacheManagerError('GET - Missing parametres.', CacheManagerError.codes.MISSING_PARAMETRES);

		const value = await this.client.hget(this.getKey(key), this._prepareParams(subkey));
		return value ? JSON.parse(value) : null;
	}

	/**
	 * Clear the cache entirely
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
		await this.client.del(this.getKey(key));
	}

	/**
	* Delete all entities.
	*/
	static async resetAll() {
		await this.client.flushall('ASYNC');
	}

	/**
     * Close connection
     */
	static close() {
		return Promise.all(this.clients.map(client => {
			const promise = new Promise(resolve => {
				client.on('end', () => logger.info('Redis - server connection has closed'));
				resolve();
			});

			client.quit();
			return promise;
		}));
	}
}

module.exports = RedisManager;

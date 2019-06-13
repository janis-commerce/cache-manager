'use strict';

const { promisify } = require('util');
const md5 = require('md5');
const path = require('path');
const logger = require('@janiscommerce/logger');
const redis = require('redis');
const CacheManagerError = require('./cache-manager-error');

/**
*    RedisManager class
*/
class RedisManager {

	get MS() {
		return process.env.MICROSERVICE || 'node';
	}

	/**
     * Get the Redis Config JSON path
     */
	get configPath() {

		return path.join(process.cwd(), 'config/redis.json');
	}

	/**
     * Cache the Redis config.
	* @param {String} route Config JSON path
     */
	cacheConfig() {

		let config;

		try {
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
	get config() {
		if(!this._config)
			this.cacheConfig();

		return this._config;
	}

	set keyPrefix(prefix) {
		this._keyPrefix = prefix;
	}

	get keyPrefix() {
		return this._keyPrefix;
	}

	getKey(key) {
		return `${this.keyPrefix}${key}`;
	}

	/**
     * Prepares the params, adding MS prefix     *
    * @param {object} params The parameters
    * @return {String} encoded parameters
    */
	_prepareParams(params) {
		return md5(JSON.stringify({
			_MS: this.MS,
			...params
		}));
	}

	/**
     * Initialize a Redis prefix in order to be ready to use.
     * @param {String} prefix Name of the client-prefix.
     */
	constructor(clientPrefix) {

		this.keyPrefix = this.validClientPrefix(clientPrefix);
		this.clients = [];
		this.inited = null;

		this.client = this.createClient();
		this.promisify(this.client);
	}

	/**
	 *
	 * @param {String} prefix name of prefix.
	 * @returns {String} prefix name.
	 */
	validClientPrefix(clientPrefix) {
		if(typeof clientPrefix !== 'string')
			throw new CacheManagerError('Invalid client-prefix.', CacheManagerError.codes.MISSING_PARAMETRES);
		return clientPrefix;
	}

	/**
     *    Create a redis prefix
     *    @param {object} options - Redis prefix options
     *    @return {object} redis prefix
     */
	createClient(options = {}) {
		const { host, port } = this.configServer();

		const defaults = {
			host,
			port
		};

		const client = this.clientRedis(defaults, options);

		client.on('connect', () => {
			logger.info(`Redis - Prefix: ${this.keyPrefix} | connected to ${host}:${port}`);
			this.inited = true;
		});

		client.on('error', err => logger.error(err.message));

		client.on('reconnecting', () => {
			logger.warn(`Redis - Prefix: ${this.keyPrefix} | reconnecting`);
		});

		this.clients.push(client); // for close latter

		return client;
	}

	configServer() {
		const host = this.config.host || 'localhost';
		const port = this.config.port || 6739;
		return { host, port };
	}

	/**
	 * @param {Object} defaults configs
	 * @param {Object} options properties
	 */
	clientRedis(defaults, options) {
		return redis.createClient({ ...defaults, ...options });
	}

	/**
     *    Promisify redis methods
     */
	promisify() {

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
	async set(key, subkey, value) {
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
	async get(key, subkey) {
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
	async reset(key = null) {
		if(!key) // No Key, Delete All
			await this.resetAll();
		else // If only have key, Delete Entity
			await this.resetEntity(key);
	}

	/**
     * Delete an Entity and all its registries
     * @param {String} key Entity
     */
	async resetEntity(key) {
		await this.client.del(this.getKey(key));
	}

	/**
	* Delete all entities.
	*/
	async resetAll() {
		await this.client.flushall('ASYNC');
	}

	/**
     * Close connection
     */
	close() {
		return Promise.all(this.clients.map(client => {
			const promise = new Promise(resolve => {
				client.on('end', () => logger.info(`Redis - Prefix: ${this.keyPrefix} | Server connection has closed`));
				resolve();
			});

			client.quit();
			return promise;
		}));
	}
}

module.exports = RedisManager;

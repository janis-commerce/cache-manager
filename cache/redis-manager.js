'use strict';

const { promisify } = require('util');
const redis = require('redis');

const logger = require('@janiscommerce/logger');
const config = require('../config/redis.json');

/**
 *	RedisManager class - Singleton
 */

class RedisManager {

	set keyPrefix(prefix) {
		this._keyPrefix = prefix;
	}

	get keyPrefix() {
		return this._keyPrefix;
	}

	_getKey(key) {
		return `${this.keyPrefix}${key}`;
	}

	set(key, subkey, value) {
		this.client.hset(this._getKey(key), subkey, JSON.stringify(value));
	}

	constructor() {
		this.clients = [];
		this.inited = false;
	}

	initialize() {
		if(this.client)
			return;

		this.client = this.createClient();

		this.promisify(this.client);
	}

	/**
   *	Create a redis client
   *	@param {object} options - Redis client options
   *	@param {boolean} [promise=true] - Whether to promisify methods or not. There are cases where we need an unmodified client (IE: to pass to socket.io adapter)
   *	@return {object} redis client
   */
	createClient(options = {}) {
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
	*	Promisify redis methods
	*	@param {object} client - Redis client
	*	@param {object} redis client
	*/
	promisify() {

		const methods = ['hset', 'hget']; // Add more methods if needed

		for(const method of methods)
			this.client[method] = promisify(this.client[method]);
	}

	async get(key, subkey) {
		const value = await this.client.hget(this._getKey(key), subkey);
		return value ? JSON.parse(value) : null;
	}

	close() {
		return Promise.all(this.clients.map(client => {
			const promise = new Promise(resolve => client.on('end', resolve));

			client.quit();

			return promise;
		}));
	}
}

module.exports = new RedisManager();

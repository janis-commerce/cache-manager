'use strict';

const EventEmitter = require('events');
const RedisManager = require('./memory-manager');

/**
 *	Cache Notifier class - Singleton
 *	@memberof Core
 *	@extends EventEmitter
 */

class CacheNotifier extends EventEmitter {
    
	get channel() {
		return 'clear-cache';
	}

	get events() {
		return {
			CLEAR_ENTITY: 'clear-entity',
			CLEAR_ALL: 'clear-all'
		};
	}

	/**
   *	Start listening for events
   *
   */

	listen() {
		if(this.client)
			return true;

		this.client = RedisManager.createClient();

		this.client.subscribe(this.channel);
		this.client.on('message', this.handleMessage.bind(this));
	}

	/**
   *	Handle redis message
   *	@private
   *	@param {string} channel - The channel name
   *	@param {string} message - The message
   */
	handleMessage(channel, message) {
		if(channel !== this.channel || !message)
			return;

		try {
			message = JSON.parse(message);
		} catch(e) {
			/* ignore */
		}

		// If /^(\d+)-/ client ID, should remove only client cache
		// message.key = '1-ecommerce_account'

		if(message.entity) {
			return this.emit(
				this.events.CLEAR_ENTITY,
				this.sanitizeEntity(message.entity),
				this.getClientId(message.key)
			);
		}

		if(message.clear)
			return this.emit(this.events.CLEAR_ALL);
	}

	/**
	*	Sanitize entity
	*	@private
	*	@param {string} entity - The entity that will be sanitized
	*/

	sanitizeEntity(entity) {

		return entity
			.replace(/^ff_/i, '')
			.replace(/_/g, '-');

	}

	/**
	*	Get client ID
	*	@private
	*	@param {string} key - The cache key that contains client ID
	*/

	getClientId(key) {
		if(!key)
			return null;

		const [, client] = /^(\d+)-/.exec(key) || [];

		return client || null;
	}
}

module.exports = new CacheNotifier();

'use strict';

const assert = require('assert');

const CacheNotifier = require('../cache/notifier');

/* eslint-disable prefer-arrow-callback */

describe('Cache Notifier', function() {

	it('should sanitize an entity name', function() {

		assert.equal(CacheNotifier.sanitizeEntity('ff_clients'), 'clients');
		assert.equal(CacheNotifier.sanitizeEntity('api_auth'), 'api-auth');

	});

	it('should get client ID', function() {

		assert.equal(CacheNotifier.getClientId('1-2-yes'), '1');
		assert.equal(CacheNotifier.getClientId('yes'), null);
		assert.equal(CacheNotifier.getClientId(''), null);

	});

	it('should create only one Redis client', function() {

		CacheNotifier.listen();
		const { client } = CacheNotifier;
		CacheNotifier.listen(); // This should change client

		assert(client === CacheNotifier.client);
	});

	it('should trigger <CLEAR_ENTITY> event', function(done) {

		const emittedEntity = 'mock';

		CacheNotifier.once(CacheNotifier.events.CLEAR_ENTITY, entity => {
			assert.equal(entity, emittedEntity);
			done();
		});

		CacheNotifier.handleMessage(CacheNotifier.channel, JSON.stringify({ entity: emittedEntity }));

	});

	it('should trigger <CLEAR_ALL> event', function(done) {

		CacheNotifier.once(CacheNotifier.events.CLEAR_ALL, done);
		CacheNotifier.handleMessage(CacheNotifier.channel, JSON.stringify({ clear: true }));

	});


	it('should trigger <CLEAR_ALL> event', function(done) {

		CacheNotifier.once(CacheNotifier.events.CLEAR_ALL, done);
		CacheNotifier.handleMessage(CacheNotifier.channel, JSON.stringify({ clear: true }));

	});

	it('should not trigger any event if invalid channel', function(done) {

		CacheNotifier.once(CacheNotifier.events.CLEAR_ALL, () => done(new Error()));
		CacheNotifier.once(CacheNotifier.events.CLEAR_ENTITY, () => done(new Error()));
		CacheNotifier.handleMessage('invalid', JSON.stringify({ clear: true }));
		setTimeout(done, 10);

	});

	it('should not trigger any event if empty message', function(done) {

		CacheNotifier.once(CacheNotifier.events.CLEAR_ALL, () => done(new Error()));
		CacheNotifier.once(CacheNotifier.events.CLEAR_ENTITY, () => done(new Error()));
		CacheNotifier.handleMessage('invalid', '');
		setTimeout(done, 10);

	});

	it('should not trigger any event if empty message', function(done) {

		CacheNotifier.once(CacheNotifier.events.CLEAR_ALL, () => done(new Error()));
		CacheNotifier.once(CacheNotifier.events.CLEAR_ENTITY, () => done(new Error()));
		CacheNotifier.handleMessage(CacheNotifier.channel, 'invalid json');
		setTimeout(done, 10);

	});

});
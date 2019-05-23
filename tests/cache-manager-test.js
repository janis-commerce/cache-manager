'use strict';

const assert = require('assert');

const {
	RedisManager,
	MemoryManager,
	CacheNotifier
} = require('../cache');

const CacheManager = require('../index');


/* eslint-disable prefer-arrow-callback */

function sleep(s = 1) {
	return new Promise(resolve => setTimeout(resolve, s * 1000));
}

describe('Cache Manager', function() {

	describe('validateClient', function() {

		it('Should rejects when requesting client cache and no client setted', async function() {

			CacheManager.client = null;
			assert.throws(() => { CacheManager.validateClient(true); }, Error);
		});

		it('Should validates when requesting core cache without client setted', async function() {

			CacheManager.client = null;
			assert(CacheManager.validateClient(false));
		});

		it('Should validates when requesting core cache with client setted', async function() {

			CacheManager.client = { id: 1 };
			assert(CacheManager.validateClient(false));
		});

		it('Should validates when requesting client cache with client setted', async function() {

			CacheManager.client = { id: 1 };
			assert(CacheManager.validateClient(true));
		});
	});

	describe('Redis', function() {

		it('Should return RedisManager instance for CORE', function() {
			CacheManager.client = null;
			const redisCore = CacheManager.redis(false);

			assert.deepEqual(RedisManager, redisCore);
		});

		it('Should return RedisManager instance for Client', function() {
			CacheManager.client = { id: 1 };
			const redisClient = CacheManager.redis(true);

			assert.deepEqual(RedisManager, redisClient);
		});

		it('Should return RedisManager instance for Client', function() {
			CacheManager.client = { id: 1 };
			const redisClient = CacheManager.redis(true);

			assert.deepEqual(RedisManager, redisClient);
		});

		
	});

	describe('Memory', function() {

		it('Should return MemoryManager instance for CORE', function() {
			CacheManager.client = null;
			const memoryCore = CacheManager.memory(false);

			assert.deepEqual(MemoryManager, memoryCore);
		});

		it('Should return MemoryManager instance for Client', function() {
			CacheManager.client = { id: 1 };
			const memoryClient = CacheManager.memory(true);

			assert.deepEqual(MemoryManager, memoryClient);
		});
	});

	describe('Notifier', function() {

		describe('Event <CLEAR_ENTITY> notification', function() {

			it('Should clear a core entity', async function() {

				CacheManager.client = null;

				CacheManager.memory(false).set('mock', 1);

				CacheNotifier.emit(CacheNotifier.events.CLEAR_ENTITY, 'mock');

				await sleep(1); // waiting for memory clear entity

				assert.equal(CacheManager.memory(false).get('mock'), undefined);

			});

			it('Shouldn\'t clear a client entity when other client id sent', async function() {

				CacheManager.client = { id: 1 };

				CacheManager.memory(true).set('mock', 1);

				CacheNotifier.emit(CacheNotifier.events.CLEAR_ENTITY, 'mock', 2);

				await sleep(1); // waiting for memory clear entity

				CacheManager.client = { id: 1 }; // se debe setear de nuevo porque cuando se emite CLEAR_ENTITY con 2 setea el cliente 2

				assert.equal(CacheManager.memory(true).get('mock'), 1);

			});

			it('Should clear a client entity', async function() {

				CacheManager.client = { id: 1 };

				// eslint-disable-next-line no-underscore-dangle
				CacheManager.memory(true).set('mock', 1);

				CacheNotifier.emit(CacheNotifier.events.CLEAR_ENTITY, 'mock', 1);

				await sleep(1); // waiting for memory clear entity

				assert.equal(CacheManager.memory(false).get('mock'), undefined);

			});
		});

		describe('Event <CLEAR_ALL> notification', function() {

			it('Should clear all memory cache', async function() {

				CacheManager.client = null;

				CacheManager.memory(false).set('foo', [1, 2, 3]);
				CacheManager.memory(false).set('bar', 46);

				CacheManager.client = { id: 1 };

				CacheManager.memory(true).set('sarasa', 98);
				CacheManager.memory(true).set('lalala', { foo: 'bar' });

				CacheNotifier.emit(CacheNotifier.events.CLEAR_ALL);

				await sleep(1); // waiting for memory clear entity

				CacheManager.client = null;

				assert.equal(CacheManager.memory(false).get('foo'), undefined);
				assert.equal(CacheManager.memory(false).get('bar'), undefined);

				CacheManager.client = { id: 1 };

				assert.equal(CacheManager.memory(true).get('sarasa'), undefined);
				assert.equal(CacheManager.memory(true).get('lalala'), undefined);
			});
		});
	});


});

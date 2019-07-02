/* eslint-disable no-underscore-dangle */

'use strict';

const assert = require('assert');
const sandbox = require('sinon').createSandbox();
const mockRequire = require('mock-require');
const CacheManager = require('../index');
const { CacheManagerError } = require('../lib');

describe('Cache Manager Test', () => {

	let cache;

	before(() => {
		cache = new CacheManager('tests');
	});

	after(async () => {
		await cache.reset();
		cache.redis.close();
	});

	context('when manipulating data', () => {
		it('should set and get', async () => {
			sandbox.stub(cache, 'checkDependency').returns(true);

			await cache.save('KEY', 'SUB', '{id: 1}');
			const result = await cache.fetch('KEY', 'SUB');
			assert.equal(result, '{id: 1}');
			sandbox.restore();
		});

		it('should get data from redis cache', async () => {
			await cache.save('k-1', 'sk-1', '{id: k-1}');
			const result = await cache.redis.get('k-1', 'sk-1');
			assert.equal(result, '{id: k-1}');
		});

		it('should get data from memory cache', async () => {
			await cache.save('k-1', 'sk-1', '{id: k-1}');
			const result = await cache.memory.get('k-1', 'sk-1');
			assert.equal(result, '{id: k-1}');
		});

		it('should set data in memory', async () => {
			await cache.save('ff1', 'fsk1', 'memory');
			await cache.memory.reset();
			await cache.fetch('ff1', 'fsk1');
			const res = await cache.memory.get('ff1', 'fsk1');
			assert.equal(res, 'memory');
		});
	});

	context('when reset data', () => {
		it('should reset key in cache', async () => {
			await cache.save('k1', 'sk1', '{id: v1}');
			await cache.reset('k1');
			const result = await cache.fetch('k1', 'sk1');
			assert.equal(result, null);
		});

		it('should reset all', async () => {
			await cache.save('entity', 'sub', 'reset all test ');
			await cache.reset();
			const res = await cache.fetch('entity', 'sub');
			assert.equal(res, null);
		});
	});

	context('when throw error', () => {

		it('should throw error in initStrategy not implemented', () => {
			assert.throws(() => cache.initStrategy('other'), {
				name: 'CacheManagerError',
				code: CacheManagerError.codes.INVALID_STRATEGY
			});
		});

		it('should throw error when the redis module was not found', () => {
			mockRequire('../lib/redis-manager.js', '../fake.route.js');
			assert.throws(() => cache.initStrategy('redis'), {
				name: 'CacheManagerError',
				code: CacheManagerError.codes.MODULE_NOT_FOUND
			});
			mockRequire.stop('../lib/redis-manager.js');
		});

		it('should throw error when the memory module was not found', () => {
			mockRequire('../lib/memory-manager.js', '../fake.route.js');
			assert.throws(() => cache.initStrategy('memory'), {
				name: 'CacheManagerError',
				code: CacheManagerError.codes.MODULE_NOT_FOUND
			});
			mockRequire.stop('../lib/memory-manager.js');
		});

		it('should throw error when the strategy is not installed', () => {
			assert.throws(() => cache.checkDependency('notDependency'), {
				name: 'CacheManagerError',
				code: CacheManagerError.codes.DEPENDENCY_NOT_FOUND
			});
		});

		it('should throw error when missing parameters in cleanEntity', async () => {
			await assert.rejects(cache._cleanEntity(), {
				name: 'CacheManagerError',
				code: CacheManagerError.codes.WITHOUT_RESETTING
			});
		});

		it('should throw error when missing parameters in cleanAll', async () => {
			await assert.rejects(cache._cleanAll(), {
				name: 'CacheManagerError',
				code: CacheManagerError.codes.WITHOUT_RESETTING
			});
		});

		it('should throw error when missing parameters in fetch', async () => {
			await assert.rejects(cache.fetch(), {
				name: 'CacheManagerError',
				code: CacheManagerError.codes.ERROR_GET_DATA
			});
		});


		it('should throw error when the strategy is not initialized', async () => {
			const c = new CacheManager('t1');
			sandbox.stub(c, 'checkDependency').returns(true);
			c.redis.set('f1', 'sk', 'f1');
			await assert.rejects(() => c.fetch('f1', 'sk'), {
				name: 'CacheManagerError',
				code: CacheManagerError.codes.UNINITIALIZED_STRATEGY
			});
			sandbox.restore();
		});

		it('should return a boolean false', () => {
			const newCache = new CacheManager('c1');
			const spy = sandbox.spy(newCache, 'initStrategy');
			sandbox.stub(newCache, 'checkDependency').returns(false);

			newCache.init('_redis');
			assert.equal(spy.callCount, 0);
			sandbox.restore();
		});

		it('should throw error for invalid client-prefix', () => {
			assert.throws(() => cache.validateClientPrefix(1), {
				name: 'CacheManagerError',
				code: CacheManagerError.codes.INVALID_PREFIX
			});
		});

		it('save', async () => {
			await assert.rejects(cache.save('a1', 'ask1'), {
				name: 'CacheManagerError',
				code: CacheManagerError.codes.UNSAVED_DATA
			});
		});
	});
});

'use strict';

const assert = require('assert');
const sandbox = require('sinon').createSandbox();
const redisMock = require('redis-mock');
const mockRequire = require('mock-require');
// const redis = require('redis');
const CacheManager = require('../index');

describe.only('Cache Manager Test', () => {

	let cache;


	before(() => {
		/* sandbox
			.stub(redis, 'createClient')
			.returns(redisMock.createClient());

		const configs = {
			hosty: 'localhost5',
			porty: 63797
		}; */
		cache = new CacheManager('tests');
		// mockRequire(cache.redis.configPath, configs);

		/* const configs = {
			host: 'localhost5',
			port: 63797
		};

		mockRequire(CacheManager.redis.configPath, configs);
		sandbox
			.stub(redis, 'createClient')
			.returns(redisMock.createClient());

		CacheManager.initialize('Test');
		CacheManager.redis.client.setMaxListeners(0); */

	});

	after(() => {
		cache.reset();
		cache.redis.close();
		sandbox.restore();

	});

	/* it('should return the client entered', () => {
		assert.equal(cache.validClient('client'), 'client');
	});*/

	it(' should return the default client', () => {
		assert.equal(cache.validClient(1), 'DEFAULT_CLIENT');
	}); 


	it('should set and get', async() => {
		cache.save('KEY', 'SUB', '{id: 1}');
		const result = await cache.fetch('KEY', 'SUB');
		assert.equal(result, '{id: 1}');
	});

	
	it('should get data in redis cache', async() => {
		cache.save('k-1', 'sk-1', '{id: k-1}');
		await cache.memory.reset('k-1');
		const result = await cache.fetch('k-1', 'sk-1');
		assert.equal(result, '{id: k-1}');
	});

	it('should reset key in cache', async() => {
		cache.save('k1', 'sk1', '{id: v1}');
		await cache.reset('k1');
		const result = await cache.fetch('k1', 'sk1');
		assert.equal(result, null);
	});

	/* it('should there can not be two instances', () => {
		assert.equal(cache.initialize(), undefined);
	}); */

	it('should reset all', async() => {
		cache.save('entity', 'sub', 'reset all test ');
		await cache.reset();
		const res = await cache.fetch('entity', 'sub');
		assert.equal(res, null);
	});
});

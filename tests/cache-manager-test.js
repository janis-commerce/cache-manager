'use strict';

const assert = require('assert');
const sandbox = require('sinon').createSandbox();
const redisMock = require('redis-mock');
const mockRequire = require('mock-require');
const redis = require('redis');
const CacheManager = require('../index');

describe('Cache Manager Test', () => {

	before(() => {
		const configs = {
			host: 'localhost5',
			port: 63797
		};

		mockRequire(CacheManager.redis.configPath, configs);
		sandbox
			.stub(redis, 'createClient')
			.returns(redisMock.createClient());

		CacheManager.initialize('Test');
		CacheManager.redis.client.setMaxListeners(0);

	});

	after(() => {
		CacheManager.reset();
		CacheManager.redis.close();
		sandbox.restore();
	});

	it('should return the client entered', () => {

		assert.equal(CacheManager.validClient('client'), 'client');
	});

	it(' should return the default client', () => {
		assert.equal(CacheManager.validClient(1), 'DEFAULT_CLIENT');
	});


	it('should set and get', async() => {
		CacheManager.save('KEY', 'SUB', '{id: 1}');
		const result = await CacheManager.fetch('KEY', 'SUB');
		assert.equal(result, '{id: 1}');
	});

	it('should get data in redis cache', async() => {
		CacheManager.save('k-1', 'sk-1', '{id: k-1}');
		await CacheManager.memory.reset('k-1');
		const result = await CacheManager.fetch('k-1', 'sk-1');
		assert.equal(result, '{id: k-1}');
	});

	it('should reset key in cache', async() => {
		CacheManager.save('k1', 'sk1', '{id: v1}');
		await CacheManager.reset('k1');
		const result = await CacheManager.fetch('k1', 'sk1');
		assert.equal(result, null);
	});

	it('should there can not be two instances', () => {
		assert.equal(CacheManager.initialize(), undefined);
	});

	it('should reset all', async() => {
		CacheManager.save('entity', 'sub', 'reset all test ');
		await CacheManager.reset();
		const res = await CacheManager.fetch('entity', 'sub');
		assert.equal(res, null);
	});
});

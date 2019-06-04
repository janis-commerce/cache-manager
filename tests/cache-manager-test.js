'use strict';

const assert = require('assert');
const sandbox = require('sinon').createSandbox();
const redisMock = require('redis-mock');
const CacheManager = require('../index');


describe('Cache Manager Test', () => {

	let redisClient;

	before(() => {
		redisClient = sandbox
			.stub(CacheManager.redis, 'clientRedis')
			.returns(redisMock.createClient());

		CacheManager.initialize('Test');
	});

	after(() => {
		CacheManager.reset();
		redisClient.restore();
	});


	it('get in memory cache', async() => {

		CacheManager.save('KEY', 'SUB', '{id: 1}');

		const result = await CacheManager.fetch('KEY', 'SUB');

		assert.equal(result, '{id: 1}');

	});

	it('get in redis cache', async() => {

		CacheManager.save('k-1', 'sk-1', '{id: k-1}');

		await CacheManager.memory.reset('k-1');

		const result = await CacheManager.fetch('k-1', 'sk-1');

		assert.equal(result, '{id: k-1}');
	});

	it('reset key in cache', async() => {

		CacheManager.save('k1', 'sk1', '{id: v1}');

		await CacheManager.reset('k1');

		const result = await CacheManager.fetch('k1', 'sk1');

		assert.equal(result, null);

	});

	it('there can not be two instances', () => {
		assert.equal(CacheManager.initialize(), undefined);
	});

	it('reset all', async() => {

		CacheManager.save('entity', 'sub', 'reset all test ');

		await CacheManager.reset();

		const res = await CacheManager.fetch('entity', 'sub');

		assert.equal(res, null);

	});


});

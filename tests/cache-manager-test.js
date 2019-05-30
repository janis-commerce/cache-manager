'use strict';

const assert = require('assert');
const sinon = require('sinon');
const CacheManager = require('../index');


describe('Cache Manager Test', () => {

	before(() => {
		CacheManager.initialize('Test');
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
		CacheManager.save('k2', 'sk2', '{id: v2}');

		await CacheManager.reset('k1', 'reset');

		const result = await CacheManager.fetch('k1', 'sk1');
		const result2 = await CacheManager.fetch('k2', 'sk2');

		assert.equal(result, null);
		assert.equal(result2, '{id: v2}');

	});

	it('prune cache memory', async() => {

		const timer = sinon.useFakeTimers();

		CacheManager.save('e11', 'sub-e11', 'value e11');

		await CacheManager.prune('memory');

		timer.tick(3610000);

		const result1 = await CacheManager.memory.get('e11', 'sub-e11');

		assert.equal(result1, undefined);

	});

	
});

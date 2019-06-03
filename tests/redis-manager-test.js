/* eslint-disable prefer-arrow-callback */

'use strict';

const assert = require('assert');
const { RedisManager } = require('../cache');
const sinon = require('sinon');

describe('Redis Manager', function() {

	before(function() {
		RedisManager.initialize('Test');
	});

	after(function() {
		RedisManager.close();

	});

	it('config path incorrect', function() {
		const stub = sinon.stub(RedisManager, 'configPath').returns('bad-config.json');
		assert.throws(() => RedisManager.cacheConfig(), Error);
		stub.restore();
	});

	it('set and get', async() => {

		RedisManager.set('KEY', 'SUBKEY', { value: 'VALOR' });

		const res = await RedisManager.get('KEY', 'SUBKEY');

		assert.deepEqual(res, { value: 'VALOR' });

	});

	it('getting a value not set', async() => {

		RedisManager.initialize();

		const res = await RedisManager.get('KEY1', 'SUBKEY1');

		assert.equal(res, null);

	});

	it('delete a key', async() => {

		RedisManager.set('KEY', 'SUBKEY', 'VALOR');

		await RedisManager.reset('KEY');

		const res = await RedisManager.get('KEY', 'SUBKEY');

		assert.equal(res, null);

	});

	it('resetear all', async() => {

		RedisManager.set('CLAVE', 'SUBCLAVE', 'VALOR');

		RedisManager.reset();

		const res = await RedisManager.get('CLAVE', 'SUBCLAVE');

		assert.equal(res, null);

	});

	it('get wrong', () => {

		RedisManager.get().catch(err => {
			assert.equal(err.message, 'GET - Missing Parametres.');
		});

	});

	it('set wrong', () => {

		RedisManager.set().catch(err => {
			assert.equal(err.message, 'SET - Missing parametres.');
		});

	});

	it('redis ya inicializado', function() {

		assert.equal(RedisManager.initialize(), undefined);

	});

});

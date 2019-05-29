/* eslint-disable prefer-arrow-callback */

'use strict';

const assert = require('assert');
const { RedisManager } = require('../cache');

describe('Redis Manager', function() {

	before(function() {
		return RedisManager.initialize();
	});

	after(function() {
		return RedisManager.close();
	});

	it('setter y getter', async() => {

		RedisManager.set('KEY', 'SUBKEY', 'VALOR');

		const res = await RedisManager.get('KEY', 'SUBKEY');

		assert.equal(res, 'VALOR');

	});

	it('buscar algo no seteado', async() => {

		const res = await RedisManager.get('KEY1', 'SUBKEY1');

		assert.equal(res, null);

	});

	it('borrar una key', async() => {

		RedisManager.set('KEY', 'SUBKEY', 'VALOR');

		RedisManager.reset('KEY');

		const res = await RedisManager.get('KEY', 'SUBKEY');

		assert.equal(res, null);

	});

	it('resetear todo', async() => {

		RedisManager.set('CLAVE', 'SUBCLAVE', 'VALOR');

		RedisManager.reset();

		const res = await RedisManager.get('CLAVE', 'SUBCLAVE');

		assert.equal(res, null);

	});

	it('get rejected', () => {

		RedisManager.get().catch(err => {
			assert.equal(err.message, 'GET - Missing Parametres.');
		});

	});

	it('set rejected', () => {

		RedisManager.set().catch(err => {
			assert.equal(err.message, 'SET - Missing parametres.');
		});

	});


});

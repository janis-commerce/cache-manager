/* eslint-disable prefer-arrow-callback */

'use strict';

const assert = require('assert');
const chai = require('chai');
const { expect } = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { RedisManager } = require('../cache');

chai.use(chaiAsPromised);


// eslint-disable-next-line prefer-arrow-callback
describe('Redis Manager', function() {

	before(function() {
		return RedisManager.initialize();
	});

	after(function() {
		return RedisManager.close();
	});

	it('setter y getter', function() {

		RedisManager.set('KEY', 'SUBKEY', 'VALOR');

		return RedisManager.get('KEY', 'SUBKEY').then(data => {
			assert.equal(data, 'VALOR');
		});
	});

	it('buscar algo no seteado', function() {

		return RedisManager.get('KEY1', 'SUBKEY1').then(data => {
			assert.equal(data, null);
		});
	});

	it('borrar una key', function() {

		RedisManager.set('KEY', 'SUBKEY', 'VALOR');

		RedisManager.reset('KEY');

		return RedisManager.get('KEY', 'SUBKEY').then(data => {
			assert.equal(data, null);
		});

	});

	it('resetear todo', function() {

		RedisManager.set('CLAVE', 'SUBCLAVE', 'VALOR');

		RedisManager.reset();

		return RedisManager.get('CLAVE', 'SUBCLAVE').then(data => {
			assert.equal(data, null);
		});
	});

	it('get rejected', async() => {

		return RedisManager.get().catch(err => {
			expect(err).to.have.property('message');
		});
	});

	it('set rejected', async() => {

		return RedisManager.set().catch(err => {
			expect(err).to.have.property('message');
		});
	});

	it('cliente ya creado', function() {

		const redis = RedisManager;
		redis.initialize();

		assert.equal(redis.inited, true);
	});
});


'use strict';

const assert = require('assert');
const sinon = require('sinon');
const { MemoryManager } = require('../cache');


describe('Memory Manager Tests', () => {

	before(() => {
		MemoryManager.initialize('Test');
	});

	after(() => {
		MemoryManager.reset();
	});

	it('set and get', async() => {

		MemoryManager.set('KEY', 'SUBKEY', { prop: 'tests' });

		const res = await MemoryManager.get('KEY', 'SUBKEY');

		assert.deepEqual(res, { prop: 'tests' });

	});

	it('getting a value not set', async() => {

		const res = await MemoryManager.get('CLAVE', 'SK');

		assert.equal(res, undefined);

	});

	it('delete a entity', async() => {

		MemoryManager.set('K1', 'SK1', 'VALOR-1');

		await MemoryManager.reset('K1');

		assert.deepEqual(MemoryManager.checkInstance('K1'), false);

	});

	it('reset cache', async() => {

		MemoryManager.set('FIZZ', 'MOD', 'SOFT');
		MemoryManager.set('K-FIZZ', 'SK-MOD', 'K-SOFT');

		await MemoryManager.reset();

		assert.deepEqual(MemoryManager.checkInstance('FIZZ'), false);
		assert.deepEqual(MemoryManager.checkInstance('K-FIZZ'), false);

	});

	it('prune cache memory', async() => {

		const timer = sinon.useFakeTimers();

		MemoryManager.set('prune11', 'sub-prune11', 'value prune11');

		await MemoryManager.prune();

		timer.tick(3610000);

		const res = await MemoryManager.get('prune11', 'sub-prune11');

		assert.equal(res, undefined);

	});

	it('get key instance', () => {

		MemoryManager.set('cl1', 'sb2', 'valor');

		assert.equal(MemoryManager.getInstanceKey('cl1'), 'Testcl1');
	});

	/* it('reset with no instances', () => {
		MemoryManager.instances = {};
		assert.equal(MemoryManager.resetAll(), null);
	});

	it('prune with no instances', () => {
		MemoryManager.instances = {};
		assert.equal(MemoryManager.pruneAll(), null);
	}); */

	it('delete key no set', async() => {

		assert.equal(await MemoryManager.reset('some key'), undefined);
	});

	it('get key with subkey', () => {

		assert.equal(MemoryManager._getKey('key', 'sub'), 'key-sub');
	});

	it('key without subkey', () => {

		assert.equal(MemoryManager._getKey('key'), 'key');
	});
});


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

	it('should set and get data', async() => {		
		MemoryManager.set('KEY', 'SUBKEY', { prop: 'tests' });
		const res = await MemoryManager.get('KEY', 'SUBKEY');
		assert.deepEqual(res, { prop: 'tests' });
	});

	it('should getting a value not set', async() => {
		const res = await MemoryManager.get('CLAVE', 'SK');
		assert.equal(res, undefined);
	});

	it('should delete a key', async() => {
		MemoryManager.set('K1', 'SK1', 'VALOR-1');
		await MemoryManager.reset('K1');
		assert.deepEqual(MemoryManager.checkInstance('K1'), false);
	});

	it('should detect the error when setting data wrong', () => {
		assert.throws(() => MemoryManager.set('only key'));
	});

	it('should catch the error when getting data wrong', async() => {
		await assert.rejects(() => MemoryManager.get('key'),
			{
				constructor: Error,
				message: 'GET - Missing parametres.'
			});
	});

	it('should reset cache', async() => {
		MemoryManager.set('FIZZ', 'MOD', 'SOFT');
		MemoryManager.set('K-FIZZ', 'SK-MOD', 'K-SOFT');
		await MemoryManager.reset();
		assert.deepEqual(MemoryManager.checkInstance('FIZZ'), false);
		assert.deepEqual(MemoryManager.checkInstance('K-FIZZ'), false);
	});

	it('should prune cache memory', async() => {
		const timer = sinon.useFakeTimers();
		MemoryManager.set('prune11', 'sub-prune11', 'value prune11');
		await MemoryManager.prune();

		// simulating time to prune old entries
		timer.tick(3610000);
		const res = await MemoryManager.get('prune11', 'sub-prune11');
		assert.equal(res, undefined);
	});

	it('should get key instance', () => {
		MemoryManager.set('cl1', 'sb2', 'valor');
		assert.equal(MemoryManager.getInstanceKey('cl1'), 'Testcl1');
	});

	it('should delete key no set', async() => {
		assert.equal(await MemoryManager.reset('some key'), undefined);
	});

	it('should get key with subkey', () => {
		assert.equal(MemoryManager.getKey('key', 'sub'), 'key-sub');
	});

	it('should get key without subkey', () => {
		assert.equal(MemoryManager.getKey('key'), 'key');
	});
});


'use strict';

const assert = require('assert');
const sinon = require('sinon');
const { CacheManagerError } = require('../cache');
const MemoryManager = require('../cache/memory-manager');


describe.only('Memory Manager Tests', () => {

	let memory;

	before(() => {
		memory = new MemoryManager('Test');
	});

	after(() => {
		memory.reset();
	});

	it('invalid client-prefix', () => {
		assert.throws(() => memory.validClientPrefix({ prefix: 'algo' }));
	});

	it('should set and get data', async() => {		
		memory.set('KEY', 'SUBKEY', { prop: 'tests' });
		const res = await memory.get('KEY', 'SUBKEY');
		assert.deepEqual(res, { prop: 'tests' });
	});

	it('should getting a value not set', async() => {
		const res = await memory.get('CLAVE', 'SK');
		assert.equal(res, undefined);
	});

	it('should delete a key', async() => {
		memory.set('K1', 'SK1', 'VALOR-1');
		await memory.reset('K1');
		assert.deepEqual(memory.checkInstance('K1'), false);
	});

	it('should detect the error when setting data wrong', () => {
		assert.throws(() => memory.set('only key'), {
			name: 'CacheManagerError',
			code: CacheManagerError.codes.MISSING_PARAMETRES
		});
	});

	it('should catch the error when getting data wrong', async() => {
		await assert.rejects(() => memory.get('key'),
			{
				name: 'CacheManagerError',
				code: CacheManagerError.codes.MISSING_PARAMETRES
			});
	});

	it('should reset cache', async() => {
		memory.set('FIZZ', 'MOD', 'SOFT');
		memory.set('K-FIZZ', 'SK-MOD', 'K-SOFT');
		await memory.reset();
		assert.deepEqual(memory.checkInstance('FIZZ'), false);
		assert.deepEqual(memory.checkInstance('K-FIZZ'), false);
	});

	it('should prune cache memory', async() => {
		const timer = sinon.useFakeTimers();
		memory.set('prune11', 'sub-prune11', 'value prune11');
		await memory.prune();

		// simulating time to prune old entries
		timer.tick(3610000);
		const res = await memory.get('prune11', 'sub-prune11');
		assert.equal(res, undefined);
		timer.restore();
	});

	it('should get key instance', () => {
		memory.set('cl1', 'sb2', 'valor');
		assert.equal(memory.getInstanceKey('cl1'), 'Testcl1');
	});

	it('should delete key no set', async() => {
		assert.equal(await memory.reset('some key'), undefined);
	});

	it('should get key with subkey', () => {
		assert.equal(memory.getKey('key', 'sub'), 'key-sub');
	});

	it('should get key without subkey', () => {
		assert.equal(memory.getKey('key'), 'key');
	});

	it('should cant reset', () => {
		const stub = sinon.stub(memory, 'instances').value({});
		assert.equal(memory.resetAll(), null);
		stub.restore();
	})
});

'use strict';

const assert = require('assert');
const sinon = require('sinon');
const path = require('path');
const mockRequire = require('mock-require');
const memoryMock = require('../mocks/lru-cache-mock');

mockRequire(path.join(process.cwd(), 'node_modules', 'lru-cache'), memoryMock);
const MemoryManager = require('../lib/memory-manager');
const { CacheManagerError } = require('../lib');


describe('Memory Manager Tests', () => {

	let memory;

	before(() => {
		memory = new MemoryManager('Test');
	});

	after(() => {
		memory.reset();
	});

	context('when should throw erros', () => {
		it('should detect the error when setting data wrong', async () => {
			await assert.rejects(memory.set('only key'), {
				name: 'CacheManagerError',
				code: CacheManagerError.codes.MISSING_PARAMETRES
			});
		});

		it('should catch the error when getting data wrong', async () => {
			await assert.rejects(() => memory.get('key'),
				{
					name: 'CacheManagerError',
					code: CacheManagerError.codes.MISSING_PARAMETRES
				});
		});

		it('should invalid client-prefix', () => {
			assert.throws(() => memory.validateClientPrefix({ prefix: 'algo' }), {
				name: 'CacheManagerError',
				code: CacheManagerError.codes.INVALID_PREFIX
			});
		});
	});

	context('when manipulating data', () => {

		it('should set and get data', async () => {
			memory.set('KEY', 'SUBKEY', { prop: 'tests' });
			const res = await memory.get('KEY', 'SUBKEY');
			assert.deepEqual(res, { prop: 'tests' });
		});

		it('should getting a value not set', async () => {
			const res = await memory.get('CLAVE', 'SK');
			assert.equal(res, undefined);
		});

		it('should get key instance', () => {
			memory.set('cl1', 'sb2', 'valor');
			assert.equal(memory.getInstanceKey('cl1'), 'Testcl1');
		});

		it('should get key with subkey', () => {
			assert.equal(memory.getKey('key', 'sub'), 'key-sub');
		});

		it('should get key without subkey', () => {
			assert.equal(memory.getKey('key'), 'key');
		});
	});

	context('when should reset data', () => {

		it('should delete a key', async () => {
			memory.set('K1', 'SK1', 'VALOR-1');
			await memory.reset('K1');
			assert.deepEqual(memory.checkInstance('K1'), false);
		});

		it('should reset cache', async () => {
			memory.set('FIZZ', 'MOD', 'SOFT');
			memory.set('K-FIZZ', 'SK-MOD', 'K-SOFT');
			await memory.reset();
			assert.deepEqual(memory.checkInstance('FIZZ'), false);
			assert.deepEqual(memory.checkInstance('K-FIZZ'), false);
		});

		it('should prune cache memory', async () => {
			const timer = sinon.useFakeTimers();
			memory.set('prune11', 'sub-prune11', 'value prune11');
			await memory.prune();

			// simulating time to prune old entries
			timer.tick(3610000);
			const res = await memory.get('prune11', 'sub-prune11');
			assert.equal(res, undefined);
			timer.restore();
		});

		it('should delete key no set', async () => {
			assert.equal(await memory.reset('some key'), undefined);
		});
	});
});

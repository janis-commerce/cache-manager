
'use strict';

const assert = require('assert');
const chai = require('chai');
const { expect } = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { MemoryManager } = require('../cache');

chai.use(chaiAsPromised);

describe('Memory Manager Tests', () => {

	before(() => {
		return MemoryManager.initialize();
	});

	after(() => {
		return MemoryManager.reset();
	});

	it('setear y getear en cache de memoria', async() => {

		MemoryManager.set('KEY', 'SUBKEY', 'VALOR');

		const res = await MemoryManager.get('KEY', 'SUBKEY');

		assert.equal(res, 'VALOR');

	});

	it('buscar algo no seteado', async() => {

		const res = await MemoryManager.get('CLAVE', 'SK');

		assert.equal(res, undefined);

	});

	it('eliminar una entidad', () => {

		MemoryManager.set('K1', 'SK1', 'VALOR-1');

		MemoryManager.reset('K1');

		assert.deepEqual(MemoryManager.checkInstance('K1'), false);

	});

	it('resetear la cache memory', () => {

		MemoryManager.set('FIZZ', 'MOD', 'SOFT');
		MemoryManager.set('K-FIZZ', 'SK-MOD', 'K-SOFT');

		MemoryManager.reset();

		assert.deepEqual(MemoryManager.checkInstance('FIZZ'), false);
		assert.deepEqual(MemoryManager.checkInstance('K-FIZZ'), false);

	});

	it('prune all', () => {

		for(let i = 0; i < 10; i++)
			MemoryManager.set(`KEY${i}`, `SUB${i}`, `VALOR${i}`);

		MemoryManager.prune();

		setTimeout(async() => {
			await MemoryManager.get('KEY1', 'SUB1').then(data => {
				assert.equal(data, undefined);
			});
		}, 1000);
	});

	it('prune all', async () => {

		for(let i = 0; i < 100; i++)
			MemoryManager.set(`KEY${i}`, `SUB${i}`, `VALOR${i}`);

		await MemoryManager.prune();

		/* const data = await MemoryManager.get('KEY1', 'SUB1');
		assert.equal(data, undefined); */

		setTimeout( async () => {
			const data = await MemoryManager.get('KEY1', 'SUB1');
			assert.equal(data, undefined);
		}, 1200);

		
	});
});

/* it('prune instance', () => {

	}); */

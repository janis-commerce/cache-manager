
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const { MemoryManager } = require('../cache');


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

	it('prune cache memory', async() => {

		const timer = sinon.useFakeTimers();

		MemoryManager.set('prune11', 'sub-prune11', 'value prune11');

		await MemoryManager.prune();

		timer.tick(3610000);

		const res = await MemoryManager.get('prune11', 'sub-prune11');

		assert.equal(res, undefined);
		
	});

	/* it('prune all 2', async () => {

		for(let i = 0; i < 100; i++)
			MemoryManager.set(`KEY${i}`, `SUB${i}`, `VALOR${i}`);

		await MemoryManager.prune();

		const data = await MemoryManager.get('KEY1', 'SUB1');
		assert.equal(data, undefined);

		setTimeout( async () => {
			const data = await MemoryManager.get('KEY1', 'SUB1');
			console.log('DATA : ', data)
			assert.equal(data, undefined);
		}, 1200);
	}); */
});

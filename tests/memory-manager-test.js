
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

	it('setear y getear en memoria', () => {

		MemoryManager.set('KEY', 'SUBKEY', 'VALOR');

		return MemoryManager.get('KEY', 'SUBKEY').then(data => {
			assert.equal(data, 'VALOR');
		});
	});

	it('buscar algo no seteado', () => {

		return MemoryManager.get('CLAVE', 'SK').then(data => {
			assert.equal(data, undefined);
		});
	});

	it('eliminar una instancia', () => {

		MemoryManager.set('K1', 'SK1', 'VALOR-1');

		MemoryManager.reset('K1');

		assert(!MemoryManager.checkInstance('K1'));

	});

	it('resetear la cache memory', () => {

		MemoryManager.set('FIZZ', 'MOD', 'SOFT');
		MemoryManager.set('K-FIZZ', 'SK-MOD', 'K-SOFT');

		MemoryManager.reset();

		assert(!MemoryManager.checkInstance('FIZZ'));
		assert(!MemoryManager.checkInstance('K-FIZZ'));

	});

	it('prune all', () => {

		for(let i = 0; i < 100; i++)
			MemoryManager.set(`KEY${i}`, `SUB${i}`, `VALOR${i}`);

		MemoryManager.prune();

		setTimeout(() => {
			MemoryManager.get('KEY1', 'SUB1').then(data => {
				assert.equal(data, undefined);
			});
		}, 1000);
	});

	it('prune all', () => {

		for(let i = 0; i < 100; i++)
			MemoryManager.set(`KEY${i}`, `SUB${i}`, `VALOR${i}`);

		MemoryManager.prune();

		setTimeout(() => {
			MemoryManager.get('KEY1', 'SUB1').then(data => {
				assert.equal(data, 'VALOR1');
			});
		}, 1200);

		setTimeout(() => {
			MemoryManager.get('KEY1', 'SUB1').then(data => {
				assert.equal(data, undefined);
			});
		}, 1500);
	});

	/* it('prune instance', () => {

	}); */

});

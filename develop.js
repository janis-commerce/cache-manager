/* eslint-disable no-console */

'use strict';

const logger = require('@janiscommerce/logger');
const { CacheManager, RedisManager, MemoryManager } = require('./cache');

//  memory manager

MemoryManager.initialize('Fizzmod');
MemoryManager.reset();

MemoryManager.set('KEY1', 'SUBKEY', 'VALOR-1');
MemoryManager.set('KEY2', 'SUBKEY', 'VALOR-2');
MemoryManager.set('KEY3', 'SUBKEY', 'VALOR-3');
// console.log(MemoryManager.getInstance('KEY'));
MemoryManager.get('KEY1', 'SUBKEY').then(data => console.log(data));
MemoryManager.get('KEY2', 'SUBKEY').then(data => console.log(data));
MemoryManager.get('KEY3', 'SUBKEY').then(data => console.log(data));

// console.log(MemoryManager.getInstance('KEY1'))
MemoryManager.set('K1', 'SK1', 'VALOR-1');

MemoryManager.reset('K1');

console.log(MemoryManager.checkInstance('K1'));

for(let i = 0; i < 100; i++)
	MemoryManager.set(`KEY${i}`, `SUB${i}`, `VALOR${i}`);

MemoryManager.prune();
MemoryManager.get('KEY1', 'SUB1').then(data => {
	console.log('PRUNE ', data);
});

setTimeout(() => {
	MemoryManager.get('KEY1', 'SUB1').then(data => {
		console.log('PRUNE ', data);
	});
}, 1000);

setTimeout(() => {
	MemoryManager.get('KEY1', 'SUB1').then(data => {
		console.log('PRUNE ', data);
	});
}, 1200);

/* MemoryManager.get('CLAVE', 'SK').then(data => {
		console.log(data)
	}); */
	// 4372 2718

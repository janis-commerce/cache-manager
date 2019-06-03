/* eslint-disable no-console */

'use strict';

const LRU = require('lru-cache');
const { CacheManager, RedisManager, MemoryManager } = require('./cache');


//  memory manager
async function memoManager() {
	MemoryManager.initialize('Fizzmod');
	MemoryManager.reset();

	MemoryManager.set('KEY1', 'SUBKEY', 'VALOR-1');
	MemoryManager.set('KEY2', 'SUBKEY', 'VALOR-2');
	MemoryManager.set('KEY3', 'SUBKEY', 'VALOR-3');
	/* MemoryManager.get('KEY1', 'SUBKEY').then(data => console.log(data));
	MemoryManager.get('KEY2', 'SUBKEY').then(data => console.log(data));
	MemoryManager.get('KEY3', 'SUBKEY').then(data => console.log(data)); */

	await MemoryManager.reset('KEY3');

	/* const key1 = await MemoryManager.get('KEY1', 'SUB1')
	console.log(key1); */

	// await MemoryManager.reset('KEY2');

	// borradodos
	MemoryManager.get('KEY1', 'SUBKEY').then(data => console.log(data));
	MemoryManager.get('KEY2', 'SUBKEY').then(data => console.log(data));
	MemoryManager.get('KEY3', 'SUBKEY').then(data => console.log(data));
}

// memoManager()

const cache = async() => {
	// inicializar
	CacheManager.initialize('Fede');


	// save in all cache strategies
	CacheManager.save('k2', 'sk2', 'hello friend dos');
	CacheManager.save('k3', 'sk3', 'hello friend tres');

	// await CacheManager.resetEntity('k3');
	await CacheManager.resetEntity('k3');

	// await CacheManager.resetEntity('k2');
	// fetched data from memory
	const res1 = await CacheManager.fetch('k2', 'sk2');
	console.log(res1);

	

	// console.log('result ', result);
	// console.log('result2 ', result2);
};

cache();

async function redis() {

	CacheManager.initialize('fede-Redis');
	CacheManager.save('k2', 'sk2', 'hello friend');
	CacheManager.save('k3', 'sk3', 'hello friend');

	await CacheManager.redis.reset('k2');

	const res = await CacheManager.redis.get('k3', 'sk3');
	console.log(res);

	const res1 = await CacheManager.redis.get('k2', 'sk2');
	console.log(res1);


}

// redis();




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
	MemoryManager.get('KEY1', 'SUBKEY').then(data => console.log(data));
	MemoryManager.get('KEY2', 'SUBKEY').then(data => console.log(data));
	MemoryManager.get('KEY3', 'SUBKEY').then(data => console.log(data));

	// console.log(MemoryManager.getInstance('KEY1'))
	MemoryManager.set('K1', 'SK1', 'VALOR-1');

	await MemoryManager.reset('K1');

	const key1 = await MemoryManager.get('KEY1', 'SUB1')
	console.log(key1);

	await MemoryManager.reset('KEY2');

	// borradodos
	MemoryManager.get('KEY1', 'SUBKEY').then(data => console.log(data));
	MemoryManager.get('KEY2', 'SUBKEY').then(data => console.log(data));
}

// memoManager()

const cache = async() => {
	// inicializar
	CacheManager.initialize('Fede');


	// save in all cache strategies
	CacheManager.save('k2', 'sk2', 'hello friend');


	// await CacheManager.reset();
	// save data only in memory cache
	CacheManager.memory.set('mem', 'subkey', { cache: 'memory' });

	// save data only in redis cache
	CacheManager.redis.set('red', 'subkey', { cache: 'redis' });

	// fetched data from memory
	CacheManager.memory.get('mem', 'subkey').then(data => {
		console.log(data);
	});

	// fetched data from redis
	CacheManager.redis.get('red', 'subkey').then(data => {
		console.log(data);
	});

	/* const result = await CacheManager.fetch('k1', 'sk1');
	const result2 = await CacheManager.fetch('k2', 'sk2'); */
/* 
	CacheManager.fetch('k2', 'sk2').then(data => console.log(data))
		.catch(err => console.log(err.message));
	CacheManager.fetch('k1', 'sk1').then(data => console.log(data))
		.catch(err => console.log(err.message)); */

	// console.log('result ', result);
	// console.log('result2 ', result2);
};

cache();

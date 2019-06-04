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

	await MemoryManager.reset();

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

	const res1 = await CacheManager.fetch('k2', 'sk2');
	console.log(res1);
};

// cache();

async function redis() {

	RedisManager.initialize('fede-Redis');
	// RedisManager.set('k2', 'sk2', 'hello friend');
	// RedisManager.set('k3', 'sk3', 'hello friend');

	// await RedisManager.reset();

	const res = await RedisManager.get('k3', 'sk3');
	console.log(res);

	const res1 = await RedisManager.get('k2', 'sk2');
	console.log(res1);

	setTimeout(async() => {
		await RedisManager.close();
	}, 2000);


}

redis();

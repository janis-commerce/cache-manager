/* eslint-disable no-console */

'use strict';

const LRU = require('lru-cache');
const redis = require('redis');
const redisMock = require('redis-mock');
const { CacheManager, RedisManager, MemoryManager } = require('./cache');

function redismocks() {

	const client = redisMock.createClient();

	client.on('connect', () => console.log('conectado'));
	client.on('error', error => console.log(error.message));

	client.set('K-1', 'valor k 1');
	client.set('K-2', 'valor k 2');
	client.set('K-3', 'valor k 3');

	// client.del('K-2');
	client.flushall();

	client.get('K-1', (err, data) => {
		if(err)
			throw Error('ERRORRRR');

		console.log(data);
	});

	client.get('K-2', (err, data) => {
		if(err)
			throw Error('ERRORRRR');

		console.log(data);
	});

	client.get('K-3', (err, data) => {
		if(err)
			throw Error('ERRORRRR');

		console.log(data);
	});
}

// redismocks();


//  memory manager
async function memoManager() {
	MemoryManager.initialize('Fizzmod');
	MemoryManager.reset();

	MemoryManager.set('KEY1', 'SUBKEY', 'VALOR-1');
	MemoryManager.set('KEY2', 'SUBKEY', 'VALOR-2');
	MemoryManager.set('KEY3', 'SUBKEY', 'VALOR-3');

	await MemoryManager.reset();

	/* 	try {
		MemoryManager.set('k', 'k');
	} catch(error) {
		console.log(error.message);
	} */

	// borradodos
	/* MemoryManager.get('KEY1', 'SUBKEY').then(data => console.log(data));
	MemoryManager.get('KEY2', 'SUBKEY').then(data => console.log(data));
	MemoryManager.get('KEY3', 'SUBKEY').then(data => console.log(data)); */
}

// memoManager();

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

async function rediss() {

	RedisManager.initialize('fede-Redis');
	RedisManager.set('k2', 'sk2', 'hello friend');
	RedisManager.set('k3', 'sk3', 'hello friend');

	await RedisManager.reset('k3');

	const res = await RedisManager.get('k3', 'sk3');
	console.log(res);

	const res1 = await RedisManager.get('k2', 'sk2');
	console.log(res1);

	setTimeout(async() => {
		await RedisManager.close();
	}, 5000);
}

// rediss();

async function memoryReadme() {
	CacheManager.memory.initialize('client memory');

	CacheManager.memory.set('mem', 'subkey', { cache: 'memory' });
	CacheManager.memory.set('keymem', 'submem', 'memory value');

	const mem = await CacheManager.memory.get('mem', 'subkey');
	console.log(mem); // { cache: 'memory' }

	await CacheManager.memory.reset('mem');

	const memDelete = await CacheManager.memory.get('mem', 'subkey');
	console.log(memDelete); // undefined

	await CacheManager.memory.reset();

	const keymem = await CacheManager.memory.get('keymem', 'submem');
	console.log(keymem); // undefined
}

// memoryReadme();

async function redisReadme() {
	CacheManager.redis.initialize('client redis');

	CacheManager.redis.set('red', 'subkey', { cache: 'redis' });
	CacheManager.redis.set('red-2', 'sub-2', 'redis-2');

	CacheManager.redis.get('red', 'subkey').then(data => {
		console.log(data); // { cache: 'redis' }
	});

	await CacheManager.redis.reset('red-2');

	const del = await CacheManager.redis.get('red-2', 'sub-2');
	console.log(del); // null

	await CacheManager.redis.reset();

	const red = await CacheManager.redis.get('red', 'subkey');
	console.log(red); // null

	CacheManager.redis.close();
}
redisReadme();

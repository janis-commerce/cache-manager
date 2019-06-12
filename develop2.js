/* eslint-disable no-console */
'use strict';

const { RedisManager, MemoryManager, CacheManager } = require('./cache/');

async function redisManager() {

	const redis = new RedisManager('PREFIX');
	const redis2 = new RedisManager('OTHER-2');
	const redis3 = new RedisManager('OTHER-3');

	redis.set('key1', 's1', { valor: 'keys1' });
	redis.set('key2', 's2', { valor: 'keys2' });
	redis.set('key3', 's3', { valor: 'keys3' });

	redis2.set('redis2', 'r2', { valor: 'other-keys-2' });

	redis3.set('redis3', 'r3', { valor: 'other-keys-3' });

	// console.log(redis3.clients.length);

	// await redis3.reset();
	// await redis3.reset();

	const s1 = await redis.get('key1', 's1');
	console.log(s1);

	const s2 = await redis.get('key2', 's2');
	console.log(s2);

	const s3 = await redis.get('key3', 's3');
	console.log(s3);

	const r2 = await redis2.get('redis2', 'r2');
	console.log(r2);

	const r3 = await redis3.get('redis3', 'r3');
	console.log(r3);


	await redis.reset();
	await redis2.reset();
	await redis3.reset();

	/* redis.close();
	redis2.close(); */
}

redisManager();
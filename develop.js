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

	redis.close();
	redis2.close();
}

// redisManager();

async function memory() {

	const mem1 = new MemoryManager('memory1');
	const mem2 = new MemoryManager('memory2');

	// mem1
	mem1.set('k1', 'sk1', { value: 1 });
	mem1.set('k1', 'sk2', { value: 2 });
	mem1.set('k3', 'sk3', { value: 3 });

	// mem2
	mem2.set('k1', 'sk1', { value: 12 });
	mem2.set('k1', 'sk2', { value: 22 });
	mem2.set('k3', 'sk3', { value: 32 });

	await mem2.reset('k1');

	// log de mem1
	const sk1 = await mem1.get('k1', 'sk1');
	const sk2 = await mem1.get('k1', 'sk2');
	const sk3 = await mem1.get('k3', 'sk3');
	console.log('---------------------------mem1');
	console.log(sk1);
	console.log(sk2);
	console.log(sk3);

	// log de mem2
	const sk12 = await mem2.get('k1', 'sk1');
	const sk22 = await mem2.get('k1', 'sk2');
	const sk32 = await mem2.get('k3', 'sk3');
	console.log('---------------------------mem2');
	console.log(sk12);
	console.log(sk22);
	console.log(sk32);

	await mem1.reset();
	await mem2.reset();
}

// memory();

async function cache() {
	const cache1 = new CacheManager('PRIMERA');
	const cache3 = new CacheManager('SEGUNDA');

	// set data
	cache1.save('k1', 'sk1', { value: '1-sk1' });
	cache1.save('k1', 'sk2', { value: '1-sk2' });
	cache1.save('k1', 'sk3', { value: '11-sk1' });

	cache3.save('k3', 'sk3', { value: '3-sk3' });
	cache3.save('k3', 'sk33', { value: '3-sk33' });
	cache3.save('k33', 'sk333', { value: '33-sk333' });

	/* console.log(cache1.client);
	cache1.client = 'fedex';
	console.log(cache1.client); */
	// cache1.save('k1', 'sk3', { value: 'k11-sk3' });

	// reset
	// cache1.reset();
	cache3.redis.reset('k3');
	// cache1.redis.reset('k2');
	// cache3.reset();

	// get
	const sk11 = await cache1.fetch('k1', 'sk1');
	const sk12 = await cache1.fetch('k1', 'sk2');
	const sk13 = await cache1.fetch('k1', 'sk3');

	const sk3 = await cache3.redis.get('k3', 'sk3');
	const sk33 = await cache3.redis.get('k3', 'sk33');
	const sk333 = await cache3.redis.get('k33', 'sk333');

	// print data

	
	console.log('-----------------------CACHE1');
	console.log(sk11);
	console.log(sk12);
	console.log(sk13);
	

	setImmediate(() => {
		console.log('----------------------CACHE3');
		console.log(sk3);
		console.log(sk33);
		console.log(sk333);
	})

	

	// console.log(cache1.redis.clients);
	// cache3.redis.close();
	// cache1.redis.close();
}

cache();

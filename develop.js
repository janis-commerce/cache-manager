/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */

'use strict';

const path = require('path');

const CacheManager = require('./index');

async function cacheStrategy() {

	console.log('--------------- INDIVIDUAL STRATEGY ---------------\n');
	const test = new CacheManager('test');

	// save data in redis
	test.use('redis').set('k1', 'r1', { value: 'r1' });
	test.use('redis').set('k2', 'r2', { value: 'r2' });

	// save data in memory
	test.use('memory').set('k1', 'm1', { value: 'm1' });
	test.use('memory').set('k2', 'm2', { value: 'm2' });

	// reset k2 memory
	// test.use('memory').reset('k2');

	test.use('memory').reset('k2');
	test.use('redis').reset('k1');

	// redis get data
	const sk1 = await test.use('redis').get('k1', 'r1');
	const sk2 = await test.use('redis').get('k2', 'r2');
	console.log('\n');
	console.log('---------- REDIS ----------');
	console.log('redis --- sk1: ', sk1);
	console.log('redis --- sk2: ', sk2);

	console.log('\n');

	// memory get data
	const m1 = await test.use('memory').get('k1', 'm1');
	const m2 = await test.use('memory').get('k2', 'm2');
	console.log('---------- MEMORY ----------');
	console.log('memory --- m1: ', m1);
	console.log('memory --- m2: ', m2);

	test.use('redis').close();
}

// cacheStrategy();

async function cacheAll() {
	const cache = new CacheManager('cache');

	cache.save('s1', 'k1', { value: 'sk1' });
	cache.save('s2', 'k2', { value: 'sk2' });
	cache.save('s3', 'k3', { value: 'sk3' });

	// cache.reset('s1');

	const k1 = await cache.fetch('s1', 'k1');
	console.log(k1);

	cache.reset('s2');

	const k2 = await cache.fetch('s2', 'k2');
	console.log(k2);
	/* const redis = await cache.use('redis').get('s1', 'k1');
	console.log('-------- RESULT: ', redis); */

	// cache.reset('s2');

	/* const mem = await cache.use('memory').get('s1', 'k1');
	console.log(mem);
	const mem2 = await cache.use('memory').get('s2', 'k2');
	console.log(mem2);

	const red = await cache.use('redis').get('s1', 'k1');
	console.log(red);
	const red2 = await cache.use('redis').get('s2', 'k2');
	console.log(red2); */

	cache.use('redis').close();
}

// cacheAll();

async function cachepart() {
	const ca = new CacheManager('prefix');

	ca._memory.set('k1', 's1', { value: 'cas1' });
	ca.save('k2', 's2', { value: 'cas2' });
	ca.save('k2', 's3', { value: 'cas3' });

	/* const res = await ca.fetch('k1', 's1');
	console.log(res); */

	// ca.memory.reset('k2');
	const s1 = await ca.fetch('k1', 's1');
	console.log(s1);

	ca._memory.reset('k2')

	const s2 = await ca.fetch('k2', 's2');
	console.log(s2);

	const s3 = await ca.fetch('k2', 's3');
	console.log(s3);

	/* const res1 = await ca.fetch('k1', 's1');
	console.log(res1); */
}
cachepart();

/* const strategies = {
	memory: { dependency: 'lru-cache', hello: () => { console.log('hello memory'); } },
	redis: { dependency: 'redis', hello: () => { console.log('hello redis'); } }
}; */

// Object.values(strategies()).forEach(strategy => console.log(strategy.className));
// strategies.memory.hello();

/* eslint-disable no-console */

'use strict';

const { CacheManager, RedisManager, MemoryManager } = require('./cache');
const sinon = require('sinon');

async function mem() {


	MemoryManager.initialize('FEDE');
	MemoryManager.set('KEY1', 'SUBKEY', 'VALOR-1111');
	MemoryManager.set('KEY2', 'SUBKEY2', 'VALOR-2222');
	MemoryManager.set('KEY3', 'SUBKEY3', 'VALOR-3333');
	/* await MemoryManager.prune('KEY1');
	setTimeout(async() => {
		const me = await MemoryManager.get('KEY1', 'SUBKEY');

		console.log(me);
	}, 1000); */
	// console.log(MemoryManager._getInstanceKey('KEY1'));
	// console.log(MemoryManager.getInstance('KEY1111'));
	/* console.log(MemoryManager.getInstance('KEY1111')); */
	// console.log(Object.keys(MemoryManager.getInstances()).length === 0)


	/* await MemoryManager.reset();
	await MemoryManager.resetAllInstances(); */
	// timer.tick(3000);
	// MemoryManager.resetAllInstances();
	// console.log(MemoryManager.getInstance('KEY1111'));
	/* console.log(MemoryManager.getInstances());
	console.log(Object.keys(MemoryManager.getInstances()).length === 0) */

	// console.log(Object.keys(MemoryManager.getInstances()).length === 0);

	const ins = await MemoryManager.getInstances();

	// console.log('instancias ', ins);

	const me = await MemoryManager.get('KEY1', 'SUBKEY');

	setImmediate(async() => {

		await MemoryManager.resetAllInstances();

	});


	const ins1 = await MemoryManager.getInstances();

	console.log('instancias parte 2', ins1);

	// console.log(me);

	// console.log(Object.keys(ins.length === 3));

}


mem();

//  memory manager
function memoManager() {
	MemoryManager.initialize('Fizzmod');
	MemoryManager.reset();

	MemoryManager.set('KEY1', 'SUBKEY', 'VALOR-1');
	MemoryManager.set('KEY2', 'SUBKEY', 'VALOR-2');
	MemoryManager.set('KEY3', 'SUBKEY', 'VALOR-3');
	console.log(MemoryManager.getInstance('KEY'));
	MemoryManager.get('KEY1', 'SUBKEY').then(data => console.log(data));
	MemoryManager.get('KEY2', 'SUBKEY').then(data => console.log(data));
	MemoryManager.get('KEY3', 'SUBKEY').then(data => console.log(data));

	// console.log(MemoryManager.getInstance('KEY1'))
	MemoryManager.set('K1', 'SK1', 'VALOR-1');

	MemoryManager.reset('K1');

	// console.log(MemoryManager.checkInstance('K1'));

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


}
// memoManager()

const fede = async() => {
	// inicializar
	CacheManager.initialize('Fede');


	/* CacheManager.save('k1', 'sk1', '{id: v1}');
	CacheManager.save('k2', 'sk2', '{id: v2}');

	await CacheManager.reset('k1', 'reset');

	const result = await CacheManager.fetch('k1', 'sk1');
	const result2 = await CacheManager.fetch('k2', 'sk2');

	console.log('result ', result);
	console.log('result2 ', result2); */
};

// fede();

// redis();

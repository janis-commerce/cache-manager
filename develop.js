/* eslint-disable no-console */

'use strict';

const { CacheManager, RedisManager, MemoryManager } = require('./cache');

async function mem(){
	MemoryManager.initialize();
	MemoryManager.set('KEY1', 'SUBKEY', 'VALOR-1');

	await MemoryManager.prune('KEY1')

	setTimeout( async ()=>{
		const me = await MemoryManager.get('KEY1', 'SUBKEY')

	console.log(me)
	}, 5000)
}

mem();

//  memory manager
function memoManager() {
/* 	MemoryManager.initialize('Fizzmod');
	MemoryManager.reset();

	MemoryManager.set('KEY1', 'SUBKEY', 'VALOR-1');
	MemoryManager.set('KEY2', 'SUBKEY', 'VALOR-2');
	MemoryManager.set('KEY3', 'SUBKEY', 'VALOR-3');
	console.log(MemoryManager.getInstance('KEY'));
	MemoryManager.get('KEY1', 'SUBKEY').then(data => console.log(data));
	MemoryManager.get('KEY2', 'SUBKEY').then(data => console.log(data));
	MemoryManager.get('KEY3', 'SUBKEY').then(data => console.log(data));

	console.log(MemoryManager.getInstance('KEY1'))
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
	}, 1200); */


}
// memoManager()

const fede = async() => {
	// inicializar
	CacheManager.initialize('Fede');

	CacheManager.save('k1', 'sk1', '{id: v1}');
	CacheManager.save('k2', 'sk2', '{id: v2}');

	await CacheManager.reset('k1', 'reset');

	const result = await CacheManager.fetch('k1', 'sk1');
	const result2 = await CacheManager.fetch('k2', 'sk2');

	console.log('result ', result);
	console.log('result2 ', result2);
};

// fede();

// redis();


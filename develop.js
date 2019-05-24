/* eslint-disable no-console */
'use strict';

const logger = require('@janiscommerce/logger');
const { CacheManager, RedisManager, MemoryManager } = require('./cache');

// cache manager test
class Develop {

	constructor(client = {}) {
		this.client = client;
		this.initCache();
	}

	initCache() {
		CacheManager.initialize();
	}

	get entity() {
		return this.constructor.name.toLowerCase();
	}

	getprefix() {
		return CacheManager.getKeyPrefix(false);
	}

	getMemoryCache() {
		return CacheManager.memory();
	}

	getRedisCache() {
		CacheManager.client = this.client;
		return CacheManager.redis();
	}

	fetchCache() {
		CacheManager.client = this.client;
		return CacheManager.fetch(this.entity);
	}

	saveCache(params, results, isClientCache) {
		CacheManager.client = this.client;
		return CacheManager.save(this.entity, params, results, isClientCache);
	}
}

const develop = new Develop({id: 'develop' });
develop.fetchCache({prop: 'algo' });


//  memory manager
function memoManager() {
	const memory = MemoryManager;
	memory._keyPrefix = 'prefix';
	memory.set('mem1', 'clave1', 'value 1');
	memory.set('mem2', 'clave2');

	console.log('key: mem3 - ' + memory.get('mem3'));
	console.log('key: mem2 - ' + memory.get('mem2'));
	console.log('key: mem1 - ' + memory.get('mem1'));

	console.log(memory._getInstanceKey('mem2'));
	console.log(memory.checkInstance('mem2'));
	console.log(memory.getInstance('mem1'));
	console.log(memory._getKey('key', 'subkey'));
	memory.resetAllInstances();
	// borrando instancias
	console.log('buscando una key borrada - ' + memory.get('mem1'));
}
// memoManager();

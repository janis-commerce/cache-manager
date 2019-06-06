# Cache Manager

[![Build Status](https://travis-ci.org/janis-commerce/cache-manager.svg?branch=JCN-52-memory-manager)](https://travis-ci.org/janis-commerce/cache-manager)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/cache-manager/badge.svg?branch=JCN-52-memory-manager)](https://coveralls.io/github/janis-commerce/cache-manager?branch=JCN-52-memory-manager)


The cache-manager is a module for the management of cache, where data is stored in each cache strategy and retrieved first from the one with the highest priority. 

## Installation


```js
npm install @janiscommerce/cache-manager
```

In order to work, the package needs a configuration file at the root of the application specifying the port and the host it uses for its redis server.
```js
path/to/root/config.json
```
The expected object in config.json should be:
```js
{
    host: 'localhost',
    port: 6739
}
```

## Usage:
```js
const CacheManager = require('@janiscommerce/cache-manager')

// initialize cache manager
CacheManager.initialize('Client');
```

### save data

```js

// save in all cache strategies
CacheManager.save('key', 'subkey', { message: 'hello friend' })
```
### fetch data
```js
// fetched data in the fastest first strategy and then in the rest
CacheManager.fetch('key', 'subkey').then(data => {
    console.log(data) // '{ message: 'hello friend' }
})
```

### reset cache
```js
// reset all entities in all strategies
await CacheManager.reset();

// reset only a specific entity in all strategies
await CacheManager.resetEntity('key');
```

## API 
- `initialize('string client')`
Initialize the cache manager. Receives as a parameter a string to be able to use it as a prefix
- `save('string key', 'string subkey', 'value')`
Save data in memory and redis
- `fetched('string key', 'string subkey')`
Fetched data in the fastest strategy. Returns a promise. In case of not found a value returns null
- `reset()`
Delete all entities in cache
- `resetEntity('string key')`
Delete a especific entity in cache

You can also use redis or memory independently as follows
```js
// memory
CacheManager.memory.[method]

// redis
CacheManager.redis.[method]
```

#### API memory

- `initialize('string client')`
Initialize the memory manager if you did not previously with the cache manager initializer. Receives as a parameter a string to be able to use it as a prefix

- `set('string key', 'string subkey', 'value')`
Save data

- `get('string key', 'string subkey')`
Fetched data. Returns a promise. In case of not found a value returns undefined

- `reset()`
Delete all entities

- `reset('string key')`
Delete a especific entity

- `prune()`
Pruning old entries


#### Usage example
```js
CacheManager.memory.initialize('client memory')

// set data
CacheManager.memory.set('mem', 'subkey', { cache: 'memory' })
CacheManager.memory.set('keymem', 'submem', 'memory value')

// get data
const mem = await CacheManager.memory.get('mem', 'subkey')
console.log(mem) // { cache: 'memory' }

// delete key mem 
await CacheManager.memory.reset('mem')

// get data from the deleted key
const memDelete = await CacheManager.memory.get('mem', 'subkey')
console.log(memDelete) // undefined

// delete all keys
await CacheManager.memory.reset()

// get data from the deleted key
const keymem = await CacheManager.memory.get('keymem', 'submem')
console.log(keymem) // undefined

```


#### API redis
- `initialize('string client)`
Initialize the redis manager if you did not previously with the cache manager initializer. Receives as a parameter a string to be able to use it as a prefix

- `set('string key', 'string subkey', 'value')`
Save data

- `get('string key', 'string subkey')`
Fetched data in the fastest strategy. Returns a promise. In case of not found a value returns null

- `reset()`
Delete all entities in cache

- `reset('string key')`
Delete a especific entity in cache

- `close()`
Close connection

#### Usage example
```js
CacheManager.redis.initialize('client redis');

// save data
CacheManager.redis.set('red', 'subkey', { cache: 'redis' });
CacheManager.redis.set('red-2', 'sub-2', 'redis-2');

// get data
CacheManager.redis.get('red', 'subkey').then(data => {
	console.log(data); // { cache: 'redis' }
});

// delete key red-2
await CacheManager.redis.reset('red-2');

// get data from the deleted key
const del = await CacheManager.redis.get('red-2', 'sub-2');
console.log(del); // null

// delete all keys
await CacheManager.redis.reset();

// get data from the deleted key
const red = await CacheManager.redis.get('red', 'subkey');
console.log(red); // null

// close connection
CacheManager.redis.close();


```


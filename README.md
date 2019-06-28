# cache-manager

[![Build Status](https://travis-ci.org/janis-commerce/cache-manager.svg?branch=JCN-52-memory-manager)](https://travis-ci.org/janis-commerce/cache-manager)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/cache-manager/badge.svg?branch=JCN-52-memory-manager)](https://coveralls.io/github/janis-commerce/cache-manager?branch=JCN-52-memory-manager)


The cache-manager is a module for the management of cache, where data is stored in each cache strategy and retrieved first from the one with the highest priority. it is possible to use memory or redis individually if required


## Installation


```js
npm install @janiscommerce/cache-manager
```


To be able to use the two caching strategies implemented, you must install the following dependencies in the root of your application
```js
npm install redis 
npm install lru-cache 
```

In order to work, the package needs a configuration file at the root of the application specifying the port and the host it uses for its redis server.
```js
path/to/root/config/redis.json
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
const cacheManager = new CacheManager('client-prefix');
```

### How to save data?

```js

// save in all cache strategies
await cacheManager.save('key', 'subkey', { message: 'hello friend' })
```
### How to fetch data?
```js
// fetched data in the fastest first strategy and then in the rest
const data = await cacheManager.fetch('key', 'subkey')
console.log(data) // '{ message: 'hello friend' }

```

### How to reset cache?
```js
// reset all entities in all strategies
await cacheManager.reset();

// reset only a specific entity in all strategies
await cacheManager.reset('key');
```

## API 
- `async save('key', 'subkey', 'some value')`
Save data in memory and redis. Receives a key [string], a subkey [string] and value [any] to save.
- `async fetch('key', 'subkey')`
Fetched data in the fastest strategy. Receives the key [string] and subkey [string] as parameter with which the value was saved. Returns a promise. In case of not found a value returns null
- `async reset()`
Delete all entities in cache
- `async reset('key')`
Delete a especific entity in cache. Receives the key [string] of the entity to be deleted

You can also use redis or memory independently as follows
```js
// memory
cacheManager.memory.[method]

// redis
cacheManager.redis.[method]
```

#### API memory

- `set('key', 'subkey', 'some value')`
Save data. Receives a key [string], a subkey [string] and value [any] to save.

- `async get('key', 'subkey')`
Fetched data. Receives the key [string] and subkey [string] as parameter with which the value was saved. Returns a promise. In case of not found a value returns undefined

- `async reset()`
Delete all entities

- `async reset('key')`
Delete a especific entity. Receives the key [string] of the entity to be deleted

- `prune()`
Pruning old entries


#### Usage example
```js

// set data
cacheManager.memory.set('mem', 'subkey', { cache: 'memory' })
cacheManager.memory.set('keymem', 'submem', 'memory value')

// get data
const mem = await cacheManager.memory.get('mem', 'subkey')
console.log(mem) // { cache: 'memory' }

// delete key mem 
await cacheManager.memory.reset('mem')

// get data from the deleted key
const memDelete = await cacheManager.memory.get('mem', 'subkey')
console.log(memDelete) // undefined

// delete all keys
await cacheManager.memory.reset()

// get data from the deleted key
const keymem = await cacheManager.memory.get('keymem', 'submem')
console.log(keymem) // undefined

```


#### API redis

- `async set('key', 'subkey', 'some value')`
Save data. Receives a key [string], a subkey [string] and value [any] to save.

- `async get('key', 'subkey')`
Fetched data in the fastest strategy. Receives the key [string] and subkey [string] as parameter with which the value was saved. Returns a promise. In case of not found a value returns null

- `async reset()`
Delete all entities in cache

- `async reset('key')`
Delete a especific entity in cache. Receives the key [string] of the entity to be deleted

- `async close()`
Close connection

#### Usage example
```js

// save data
cacheManager.redis.set('red', 'subkey', { cache: 'redis' });
cacheManager.redis.set('red-2', 'sub-2', 'redis-2');

// get data
const data = cacheManager.redis.get('red', 'subkey')
console.log(data); // { cache: 'redis' }


// delete key red-2
await cacheManager.redis.reset('red-2');

// get data from the deleted key
const del = await cacheManager.redis.get('red-2', 'sub-2');
console.log(del); // null

// delete all keys
await cacheManager.redis.reset();

// get data from the deleted key
const red = await cacheManager.redis.get('red', 'subkey');
console.log(red); // null

// close connection
cacheManager.redis.close();
```


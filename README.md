# cache-manager

[![Build Status](https://travis-ci.org/janis-commerce/cache-manager.svg?branch=JCN-52-memory-manager)](https://travis-ci.org/janis-commerce/cache-manager)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/cache-manager/badge.svg?branch=JCN-52-memory-manager)](https://coveralls.io/github/janis-commerce/cache-manager?branch=JCN-52-memory-manager)


The cache-manager is a module for the management of cache, where data is stored in each cache strategy and retrieved first from the one with the highest priority. it is possible to use memory or redis individually if required


## Installation


```js
npm install @janiscommerce/cache-manager
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
CacheManager.initialize('Client');
```

### How to save data?

```js

// save in all cache strategies
CacheManager.save('key', 'subkey', { message: 'hello friend' })
```
### How to fetch data?
```js
// fetched data in the fastest first strategy and then in the rest
const data = await CacheManager.fetch('key', 'subkey')
console.log(data) // '{ message: 'hello friend' }

```

### How to reset cache?
```js
// reset all entities in all strategies
await CacheManager.reset();

// reset only a specific entity in all strategies
await CacheManager.resetEntity('key');
```

## API 
- `initialize('client-prefix')`
Initialize the cache manager. Receives as a parameter a client [string] to be able to use it as a prefix.
- `save('key', 'subkey', 'some value')`
Save data in memory and redis. Receives a key [string], a subkey [string] and value to save.
- `fetched('key', 'subkey')`
Fetched data in the fastest strategy. Receives the key [string] and subkey [string] as parameter with which the value was saved. Returns a promise. In case of not found a value returns null
- `reset()`
Delete all entities in cache
- `resetEntity('key')`
Delete a especific entity in cache. Receives the key [string] of the entity to be deleted

You can also use redis or memory independently as follows
```js
// memory
CacheManager.memory.[method]

// redis
CacheManager.redis.[method]
```

#### API memory

- `initialize('client-prefix')`
Initialize the memory manager if you did not previously with the cache manager initializer. Receives as a parameter a client [string] to be able to use it as a prefix

- `set('key', 'subkey', 'some value')`
Save data. Receives a key [string], a subkey [string] and value to save.

- `get('key', 'subkey')`
Fetched data. Receives the key [string] and subkey [string] as parameter with which the value was saved. Returns a promise. In case of not found a value returns undefined

- `reset()`
Delete all entities

- `reset('key')`
Delete a especific entity. Receives the key [string] of the entity to be deleted

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
- `initialize('client-prefix)`
Initialize the redis manager if you did not previously with the cache manager initializer. Receives as a parameter a client [string] to be able to use it as a prefix

- `set('key', 'subkey', 'some value')`
Save data. Receives a key [string], a subkey [string] and value to save.

- `get('key', 'subkey')`
Fetched data in the fastest strategy. Receives the key [string] and subkey [string] as parameter with which the value was saved. Returns a promise. In case of not found a value returns null

- `reset()`
Delete all entities in cache

- `reset('key')`
Delete a especific entity in cache. Receives the key [string] of the entity to be deleted

- `close()`
Close connection

#### Usage example
```js
CacheManager.redis.initialize('client redis');

// save data
CacheManager.redis.set('red', 'subkey', { cache: 'redis' });
CacheManager.redis.set('red-2', 'sub-2', 'redis-2');

// get data
const data = CacheManager.redis.get('red', 'subkey')
console.log(data); // { cache: 'redis' }


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


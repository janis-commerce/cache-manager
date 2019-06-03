# Cache Manager

[![Build Status](https://travis-ci.org/janis-commerce/cache-manager.svg?branch=JCN-52-memory-manager)](https://travis-ci.org/janis-commerce/cache-manager)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/cache-manager/badge.svg?branch=JCN-52-memory-manager)](https://coveralls.io/github/janis-commerce/cache-manager?branch=JCN-52-memory-manager)


The cache-manager is a module for the management of cache, where data is stored in each cache strategy and retrieved first from the one with the highest priority. 

## Installation

```
npm install @janiscommerce/cache-manager
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

//or

// save data only in memory cache
CacheManager.memory.save('mem', 'subkey', { cache: 'memory' })

// save data only in redis cache
CacheManager.redis.save('red', 'subkey', { cache: 'redis' })


```
### fetch data
```js
// fetched data in the fastest first strategy and then in the rest
CacheManager.fetch('key', 'subkey').then(data => {
    console.log(data) // '{ message: 'hello friend' }
})

//or
// fetched data from memory
CacheManager.memory.get('mem', 'subkey').then( data => {
    console.log(data)
})

// fetched data from redis
CacheManager.redis.get('red', 'subkey').then( data => {
    console.log(data)
})
```

### reset cache
```js
// reset all entities
await CacheManager.reset();

// reset only a specific entity
await CacheManager.reset('key');

//or
//reset only a specific entity in memory
await CacheManager.memory.reset('key)

//reset only a specific entity in redis
await CacheManager.redis.reset('key)

```





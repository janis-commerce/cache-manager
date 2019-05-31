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


```
### fetch data
```js
// fetched data in the fastest first strategy and then in the rest
CacheManager.fetch('key', 'subkey').then(data => {
    console.log(data) // 'value'
})
```

### reset cache
```js
// reset all entities
await CacheManager.reset();

// reset only a specific entity
await CacheManager.reset('key');
```





'use strict';

const CacheManager = require('./cache-manager');
const MemoryManager = require('./memory-manager');
const RedisManager = require('./redis-manager');

module.exports = {
	CacheManager,
	MemoryManager,
	RedisManager
};

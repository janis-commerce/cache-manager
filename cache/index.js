'use strict';

const CacheManager = require('./manager');
const MemoryManager = require('./memory-manager')
const CacheNotifier = require('./notifier')
const RedisManager = require('./redis-manager')

module.exports = {
	CacheManager,
	MemoryManager,
	CacheNotifier,
	RedisManager
};

/* eslint-disable prefer-arrow-callback */

'use strict';

const assert = require('assert');

const { RedisManager, CacheManager } = require('../cache');


// eslint-disable-next-line prefer-arrow-callback
describe('Redis Manager', function() {

	it('should method get be an instance of promise', function() {
        
		RedisManager.initialize();
		assert(RedisManager.get('f', 'f') instanceof Promise);
	});
    
});
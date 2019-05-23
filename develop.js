'use strict';

const { CacheManager } = require('./cache');

CacheManager.initialize();
CacheManager.fetch('entidad', {nombre:'entidad'}, false);
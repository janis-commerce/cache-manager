'use strict';

class CacheManagerError extends Error {

	static get codes() {
		return {
			CONFIG_NOT_FOUND: 1,
			MISSING_PARAMETRES: 2,
			INVALID_PREFIX: 3,
			INVALID_STRATEGY: 4,
			MODULE_NOT_FOUND: 5,
			DEPENDENCY_NOT_FOUND: 6,
			UNINITIALIZED_STRATEGY: 7
		};
	}

	constructor(err, code) {
		super(err);
		this.message = err.message || err;
		this.code = code;
		this.name = 'CacheManagerError';
	}
}

module.exports = CacheManagerError;

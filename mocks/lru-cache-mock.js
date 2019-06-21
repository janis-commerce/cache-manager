'use strict';

class LRUCacheMock {

	constructor() {
		this.data = [];
	}

	set(key, value) {
		const obj = {};
		obj[key] = value;
		this.data.push(obj);
	}

	get(key) {
		const res = this.data.find(obj => {
			const o = Object.keys(obj);
			return o[0] === key;
		});

		return res === undefined ? undefined : Object.values(res)[0];
	}

	reset() {
		this.data = [];
	}

	prune() {
		// is expected to erase the oldest entries
		this.data = [];
	}
}

module.exports = LRUCacheMock;

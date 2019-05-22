'use strict';

const CacheManager = require('./cache');

// comprobando si llega la isntancia
class Prueba {
	constructor() {
		this.entidad = null;
	}

	initPrueba() {
		CacheManager.initialize();
	}
}

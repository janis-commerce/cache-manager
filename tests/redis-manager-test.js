/* eslint-disable prefer-arrow-callback */

'use strict';

const assert = require('assert');
const sandbox = require('sinon').createSandbox();
const redisMock = require('redis-mock');
const mockRequire = require('mock-require');

mockRequire('redis', redisMock);
const RedisManager = require('../cache/redis-manager');
const { CacheManagerError } = require('../cache');


describe.only('Redis Manager', function() {

	context('with mocks', () => {

		let newRedis;

		before(() => {

			const configs = {
				hosty: 'localhost5',
				porty: 63797
			};

			newRedis = new RedisManager('tests');
			mockRequire(newRedis.configPath, configs);
		});

		after(() => {
			newRedis.close();
			sandbox.restore();
		});

		it('invalid client-prefix', () => {
			assert.throws(() => newRedis.validClientPrefix({ prefix: 'algo' }));
		});

		it('redis prefix', () => {

			assert.equal(newRedis.keyPrefix, 'tests');
		});

		it('should get and set data', async() => {
			newRedis.set('KEY', 'SUBKEY', { value: 'VALOR' });
			const res = await newRedis.get('KEY', 'SUBKEY');
			assert.deepEqual(res, { value: 'VALOR' });
		});

		it('should getting a value not set', async() => {

			const res = await newRedis.get('KEY1', 'SUBKEY1');
			assert.equal(res, null);
		});

		it('should delete a key', async() => {
			newRedis.set('KEY', 'SUBKEY', 'VALOR');
			await newRedis.reset('KEY');
			const res = await newRedis.get('KEY', 'SUBKEY');
			assert.equal(res, null);
		});

		it(' should reset all', async() => {
			newRedis.set('CLAVE', 'SUBCLAVE', 'VALOR');
			newRedis.reset();
			const res = await newRedis.get('CLAVE', 'SUBCLAVE');
			assert.equal(res, null);
		});

		it('should detect the error when setting data wrong', async() => {
			await assert.rejects(() => newRedis.get(),
				{
					name: 'CacheManagerError',
					code: CacheManagerError.codes.MISSING_PARAMETRES
				});
		});

		it('should catch the error when getting data wrong', async() => {
			await assert.rejects(() => newRedis.set(),
				{
					name: 'CacheManagerError',
					code: CacheManagerError.codes.MISSING_PARAMETRES
				});
		});

		it('should throw an error by incorrect configuration path', function() {
			sandbox.stub(newRedis, 'configPath').get(() => {
				return 'bad-path-config.json';
			});
			assert.throws(() => newRedis.cacheConfig());
			sandbox.restore();
		});

		it('should take the value of port and host', () => {
			sandbox.stub(newRedis, 'config').get(() => {
				return { host: 'fakehost', port: 1234 };
			});

			assert.deepEqual(newRedis.configServer(), { host: 'fakehost', port: 1234 });
			sandbox.restore();

		});

		it('should take the values ​​by default', () => {
			sandbox.stub(newRedis, 'config').get(() => {
				return { nohost: 'fakehost', noport: 1234 };
			});

			assert.deepEqual(newRedis.configServer(), { host: 'localhost', port: 6739 });
		});

		it('should the event be called once ', () => {
			const spy = sandbox.spy();
			newRedis.client.on('reconnecting', spy);
			newRedis.client.emit('reconnecting');
			sandbox.assert.calledWith(spy);
			sandbox.restore();
		});

		it('should the event be called once ', () => {
			const spy = sandbox.spy();
			newRedis.client.on('connect', spy);
			newRedis.client.emit('connect');
			sandbox.assert.calledWith(spy);
			sandbox.restore();
		});
	});
});

/* context('with mocks', () => {

		const newRedis = new RedisManager('test redis');
		before(() => {
			newRedis.client.setMaxListeners(15);
		});

		beforeEach(function() {

			newRedis.initialize('Test');
			newRedis.client.setMaxListeners(15);

			const configs = {
				hosty: 'localhost5',
				porty: 63797
			};

			mockRequire(newRedis.configPath, configs);

			sandbox
				.stub(redis, 'createClient')
				.returns(redisMock.createClient());
		});

		afterEach(function() {
			sandbox.restore();
		});

		after(function() {
			newRedis.close();
		});

		it.only('should return the client entered', () => {
			assert.equal(newRedis.validClient('client'), 'client');
		});

		it.only('should return the default client', () => {
			assert.equal(newRedis.validClient(), 'DEFAULT_CLIENT');
		});

		it.only('should get and set data', async(done) => {
			await newRedis.set('KEY', 'SUBKEY', { value: 'VALOR' });


			const res = await newRedis.get('KEY', 'SUBKEY');
			console.log(res);
			assert.deepEqual(res, { value: 'VALOR' });
			done();
		});

		it.only('should getting a value not set', async() => {

			const res = await newRedis.get('KEY1', 'SUBKEY1');
			assert.equal(res, null);
		});

		it('should delete a key', async() => {
			newRedis.set('KEY', 'SUBKEY', 'VALOR');
			await newRedis.reset('KEY');
			const res = await newRedis.get('KEY', 'SUBKEY');
			assert.equal(res, null);
		});

		it(' should reset all', async() => {
			newRedis.set('CLAVE', 'SUBCLAVE', 'VALOR');
			newRedis.reset();
			const res = await newRedis.get('CLAVE', 'SUBCLAVE');
			assert.equal(res, null);
		});

		it('should detect the error when setting data wrong', async() => {
			await assert.rejects(() => newRedis.get(),
				{
					name: 'CacheManagerError',
					code: CacheManagerError.codes.MISSING_PARAMETRES
				});
		});

		it('should catch the error when getting data wrong', async() => {
			await assert.rejects(() => newRedis.set(),
				{
					name: 'CacheManagerError',
					code: CacheManagerError.codes.MISSING_PARAMETRES
				});
		});

		it('should throw an error by incorrect configuration path', function() {
			sandbox.stub(newRedis, 'configPath').get(() => {
				return 'bad-path-config.json';
			});
			assert.throws(() => newRedis.cacheConfig(), Error);
		});

		it('should take the value of port and host', () => {
			sandbox.stub(newRedis, 'config').get(() => {
				return { host: 'fakehost', port: 1234 };
			});

			assert.deepEqual(newRedis.configServer(), { host: 'fakehost', port: 1234 });
		});

		it('should take the values ​​by default', () => {
			sandbox.stub(newRedis, 'config').get(() => {
				return { nohost: 'fakehost', noport: 1234 };
			});

			assert.deepEqual(newRedis.configServer(), { host: 'localhost', port: 6739 });
		});

		it('should the event be called once ', () => {
			const spy = sandbox.spy();
			newRedis.client.on('reconnecting', spy);
			newRedis.client.emit('reconnecting');
			sandbox.assert.calledWith(spy);
		});
	});

*/

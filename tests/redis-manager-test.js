/* eslint-disable prefer-arrow-callback */

'use strict';

const assert = require('assert');
const sandbox = require('sinon').createSandbox();
const redisMock = require('redis-mock');
const mockRequire = require('mock-require');
const redis = require('redis');
const { RedisManager, CacheManagerError } = require('../cache');

describe('Redis Manager', function() {

	context('with mocks', () => {

		beforeEach(function() {

			const configs = {
				hosty: 'localhost5',
				porty: 63797
			};

			mockRequire(RedisManager.configPath, configs);

			sandbox
				.stub(redis, 'createClient')
				.returns(redisMock.createClient());

			RedisManager.initialize('Test');
			RedisManager.client.setMaxListeners(15);

		});

		afterEach(function() {
			RedisManager.close();
			sandbox.restore();
		});

		it('should return the client entered', () => {
			assert.equal(RedisManager.validClient('client'), 'client');
		});

		it('should return the default client', () => {
			assert.equal(RedisManager.validClient(), 'DEFAULT_CLIENT');
		});

		it('should get and set data', async() => {
			RedisManager.set('KEY', 'SUBKEY', { value: 'VALOR' });
			const res = await RedisManager.get('KEY', 'SUBKEY');
			assert.deepEqual(res, { value: 'VALOR' });
		});

		it('should getting a value not set', async() => {
			RedisManager.initialize();
			const res = await RedisManager.get('KEY1', 'SUBKEY1');
			assert.equal(res, null);
		});

		it('should delete a key', async() => {
			RedisManager.set('KEY', 'SUBKEY', 'VALOR');
			await RedisManager.reset('KEY');
			const res = await RedisManager.get('KEY', 'SUBKEY');
			assert.equal(res, null);
		});

		it(' should reset all', async() => {
			RedisManager.set('CLAVE', 'SUBCLAVE', 'VALOR');
			RedisManager.reset();
			const res = await RedisManager.get('CLAVE', 'SUBCLAVE');
			assert.equal(res, null);
		});

		it('should detect the error when setting data wrong', async() => {
			await assert.rejects(() => RedisManager.get(),
				{
					name: 'CacheManagerError',
					code: CacheManagerError.codes.MISSING_PARAMETRES
				});
		});

		it('should catch the error when getting data wrong', async() => {
			await assert.rejects(() => RedisManager.set(),
				{
					name: 'CacheManagerError',
					code: CacheManagerError.codes.MISSING_PARAMETRES
				});
		});

		it('should throw an error by incorrect configuration path', function() {
			sandbox.stub(RedisManager, 'configPath').get(() => {
				return 'bad-path-config.json';
			});
			assert.throws(() => RedisManager.cacheConfig(), Error);
		});

		it('should take the value of port and host', () => {
			sandbox.stub(RedisManager, 'config').get(() => {
				return { host: 'fakehost', port: 1234 };
			});

			assert.deepEqual(RedisManager.configServer(), { host: 'fakehost', port: 1234 });
		});

		it('should take the values ​​by default', () => {
			sandbox.stub(RedisManager, 'config').get(() => {
				return { nohost: 'fakehost', noport: 1234 };
			});

			assert.deepEqual(RedisManager.configServer(), { host: 'localhost', port: 6739 });
		});

		it('should the event be called once ', () => {
			// RedisManager.client.setMaxListeners(15);
			const spy = sandbox.spy();
			RedisManager.client.on('reconnecting', spy);
			RedisManager.client.emit('reconnecting');
			sandbox.assert.calledWith(spy);
		});
	});
});

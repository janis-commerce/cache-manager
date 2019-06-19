/* eslint-disable prefer-arrow-callback */

'use strict';

const path = require('path');
const assert = require('assert');
const sandbox = require('sinon').createSandbox();
const redisMock = require('redis-mock');
const mockRequire = require('mock-require');

mockRequire('redis', redisMock);
mockRequire(path.join(process.cwd(), 'config/redis.json'), {
	host: 'localhost',
	port: 6739
});
const RedisManager = require('../lib/redis-manager');
const { CacheManagerError } = require('../lib');


describe('Redis Manager', function() {

	context('with mocks', () => {

		let newRedis;

		before(() => {
			newRedis = new RedisManager('tests');
		});

		after(() => {
			newRedis.close();
			sandbox.restore();
		});

		context('should throws error', () => {

			it('should throw error for invalid client-prefix', () => {
				assert.throws(() => newRedis.validClientPrefix(1), {
					name: 'CacheManagerError',
					code: CacheManagerError.codes.INVALID_PREFIX
				});
			});

			it('should throw error when setting data wrong', async () => {
				await assert.rejects(() => newRedis.get(),
					{
						name: 'CacheManagerError',
						code: CacheManagerError.codes.MISSING_PARAMETRES
					});
			});

			it('should throw error when getting data wrong', async () => {
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
				assert.throws(() => newRedis.cacheConfig(), {
					name: 'CacheManagerError',
					code: CacheManagerError.codes.CONFIG_NOT_FOUND
				});
				sandbox.restore();
			});
		});

		context('manipulating data', () => {

			it('should get and set data', async () => {
				newRedis.set('KEY', 'SUBKEY', { value: 'VALOR' });
				const res = await newRedis.get('KEY', 'SUBKEY');
				assert.deepEqual(res, { value: 'VALOR' });
			});

			it('should getting a value not set', async () => {
				const res = await newRedis.get('KEY1', 'SUBKEY1');
				assert.equal(res, null);
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
		});

		context('should reset data', () => {
			it('should reset a key', async () => {
				newRedis.set('KEY', 'SUBKEY', 'VALOR');
				await newRedis.reset('KEY');
				const res = await newRedis.get('KEY', 'SUBKEY');
				assert.equal(res, null);
			});

			it('should reset all', async () => {
				newRedis.set('CLAVE', 'SUBCLAVE', 'VALOR');
				newRedis.reset();
				const res = await newRedis.get('CLAVE', 'SUBCLAVE');
				assert.equal(res, null);
			});
		});

		context('should emit and catch events', () => {
			it('should the reconnect event be called once', () => {
				const spy = sandbox.spy();
				newRedis.client.on('reconnecting', spy);
				newRedis.client.emit('reconnecting');
				sandbox.assert.calledWith(spy);
				sandbox.restore();
			});

			it('should the connect event be called once ', () => {
				const spy = sandbox.spy();
				newRedis.client.on('connect', spy);
				newRedis.client.emit('connect');
				sandbox.assert.calledWith(spy);
				sandbox.restore();
			});
		});
	});
});

const request = require('request');
const rewire = require('rewire');
const sinon = require('sinon');
const helpers = require('../../helpers');
const collection = require('../../../example/collections/items');

const endpoint = '/item';
const method = 'PUT';

describe(`${method} ${endpoint}`, () => {
  const _server = rewire('../../../src/server');

  before(async () => {
    await helpers.dbStart({ uri: helpers.testMongodbUrl });
    _server.init({
      port: helpers.config.get('port'),
      host: helpers.config.get('host'),
      origin: helpers.config.get('allowedOrigins'),
      routes: helpers.config.get('routes'),
    });
    await _server.start();
  });

  afterEach(async () => {
    await helpers.dbReset();
  });

  after(async () => {
    await _server.stop();
    await helpers.dbStop();
  });

  it('should fail and return 500 because of a problem with the db', done => {
    const revert = sinon
      .stub(helpers.collectionItems, 'update')
      .callsFake(() => {
        return Promise.reject(new Error('Fake database error'));
      });

    const id = 'aaaaaaaaaaaaaaaaaaaaaaaa';
    const options = {
      method: method,
      baseUrl: helpers.baseUrl,
      url: `${endpoint}/${id}`,
      json: true,
    };
    const expectedStatusCode = 500;

    request(options, (err, response) => {
      revert.restore();
      if (err) {
        done(err);
      } else {
        const { body, statusCode } = response;
        statusCode.should.equal(expectedStatusCode);
        should.deepEqual(body, {
          status: 0,
          error: 'Internal MongoDB error',
          details: 'Fake database error',
        });
        done();
      }
    });
  });

  it('should succeed to create a new item when id is not passed', done => {
    const payload = { test: true };
    const options = {
      method: method,
      baseUrl: helpers.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    const expectedStatusCode = 200;

    request(options, (err, response) => {
      if (err) {
        done(err);
      } else {
        const { body, statusCode } = response;
        statusCode.should.equal(expectedStatusCode);
        const { _id, ..._payload } = body;
        _id.should.not.equal(null);
        should.deepEqual(_payload, payload);
        done();
      }
    });
  });

  it('should succeed to create a new item when id is passed', done => {
    const id = 'aaaaaaaaaaaaaaaaaaaaaaaa';
    const payload = { test: true };
    const options = {
      method: method,
      baseUrl: helpers.baseUrl,
      url: `${endpoint}/${id}`,
      json: true,
      body: payload,
    };
    const expectedStatusCode = 200;

    request(options, (err, response) => {
      if (err) {
        done(err);
      } else {
        const { body, statusCode } = response;
        statusCode.should.equal(expectedStatusCode);
        should.deepEqual(body, { _id: id, ...payload });
        done();
      }
    });
  });

  it('should succeed to update an existing item', done => {
    const payload = { test1: 'hello world', count: 1 };
    const options = {
      method: method,
      baseUrl: helpers.baseUrl,
      url: endpoint,
      json: true,
      body: payload,
    };
    const expectedStatusCode = 200;

    collection
      .add({ test: true, test1: 'hello' })
      .then(res => {
        const _id = res._id.toString();
        options.url += `/${_id}`;
        request(options, (err, response) => {
          if (err) {
            done(err);
          } else {
            const { body, statusCode } = response;
            statusCode.should.equal(expectedStatusCode);
            should.deepEqual(body, {
              _id,
              test1: 'hello world',
              count: 1,
            });
            done();
          }
        });
      })
      .catch(done);
  });
});

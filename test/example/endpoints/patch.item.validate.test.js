const request = require('request');
const rewire = require('rewire');
const sinon = require('sinon');
const helpers = require('../../helpers');
const collection = require('../../../example/collections/items');

const endpoint = '/item/validate';
const method = 'PATCH';

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

  it('should return 400 when authorization header is not sent', done => {
    const id = 'aaaaaaaaaaaaaaaaaaaaaaaa';
    const options = {
      method: method,
      baseUrl: helpers.baseUrl,
      url: `${endpoint}/${id}`,
      json: true,
      body: { test: 'hello world' },
    };
    const expectedStatusCode = 400;

    request(options, (err, response) => {
      if (err) {
        done(err);
      } else {
        const { body, statusCode } = response;
        statusCode.should.equal(expectedStatusCode);
        should.deepEqual(body, {
          statusCode: expectedStatusCode,
          error: 'Bad Request',
          message: 'Invalid request headers input',
        });
        done();
      }
    });
  });

  it('should return 400 when wrong authorization header is sent', done => {
    const id = 'aaaaaaaaaaaaaaaaaaaaaaaa';
    const options = {
      method: method,
      baseUrl: helpers.baseUrl,
      url: `${endpoint}/${id}`,
      json: true,
      body: { test: 'hello world' },
      headers: {
        authorization: 'b',
      },
    };
    const expectedStatusCode = 400;

    request(options, (err, response) => {
      if (err) {
        done(err);
      } else {
        const { body, statusCode } = response;
        statusCode.should.equal(expectedStatusCode);
        should.deepEqual(body, {
          statusCode: expectedStatusCode,
          error: 'Bad Request',
          message: 'Invalid request headers input',
        });
        done();
      }
    });
  });

  it('should return 400 when wrong param id is sent', done => {
    const id = '123';
    const options = {
      method: method,
      baseUrl: helpers.baseUrl,
      url: `${endpoint}/${id}`,
      json: true,
      body: { test: 'hello world' },
      headers: {
        authorization: 'a',
      },
    };
    const expectedStatusCode = 400;

    request(options, (err, response) => {
      if (err) {
        done(err);
      } else {
        const { body, statusCode } = response;
        statusCode.should.equal(expectedStatusCode);
        should.deepEqual(body, {
          statusCode: expectedStatusCode,
          error: 'Bad Request',
          message: 'Invalid request params input',
        });
        done();
      }
    });
  });

  it('should return 400 when wrong payload is sent', done => {
    const id = 'aaaaaaaaaaaaaaaaaaaaaaaa';
    const options = {
      method: method,
      baseUrl: helpers.baseUrl,
      url: `${endpoint}/${id}`,
      json: true,
      body: { test: true },
      headers: {
        authorization: 'a',
      },
    };
    const expectedStatusCode = 400;

    request(options, (err, response) => {
      if (err) {
        done(err);
      } else {
        const { body, statusCode } = response;
        statusCode.should.equal(expectedStatusCode);
        should.deepEqual(body, {
          statusCode: expectedStatusCode,
          error: 'Bad Request',
          message: 'Invalid request payload input',
        });
        done();
      }
    });
  });

  it('should succeed to patch the item', done => {
    const options = {
      method: method,
      baseUrl: helpers.baseUrl,
      url: endpoint,
      json: true,
      body: { test: 'hello world', test2: 1 },
      headers: {
        authorization: 'a',
      },
    };
    const expectedStatusCode = 200;

    collection
      .add({ test: 'hello', test1: true })
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
              test: 'hello world',
              test1: true,
              test2: 1,
            });
            done();
          }
        });
      })
      .catch(done);
  });
});

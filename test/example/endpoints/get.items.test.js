const request = require('request');
const rewire = require('rewire');
const sinon = require('sinon');
const helpers = require('../../helpers');
const collection = require('../../../example/collections/items');

const endpoint = '/items';
const method = 'GET';

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
    const revert = sinon.stub(helpers.collectionItems, 'find').callsFake(() => {
      return {
        toArray: () => {
          return Promise.reject(new Error('Fake database error'));
        },
      };
    });

    const options = {
      method: method,
      baseUrl: helpers.baseUrl,
      url: endpoint,
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

  it('should succeed to return an array of items', done => {
    const options = {
      method: method,
      baseUrl: helpers.baseUrl,
      url: endpoint,
      json: true,
    };
    const expectedStatusCode = 200;

    collection
      .add({ test: true })
      .then(collection.add({ test: true }))
      .then(() => {
        request(options, (err, response) => {
          if (err) {
            done(err);
          } else {
            const { body, statusCode } = response;
            statusCode.should.equal(expectedStatusCode);
            Array.isArray(body).should.equal(true);
            body.length.should.equal(2);
            body[0].test.should.equal(true);
            body[1].test.should.equal(true);
            body[0]._id.should.not.equal(null);
            body[1]._id.should.not.equal(null);
            done();
          }
        });
      })
      .catch(done);
  });

  it('should succeed to return an empty array of clients', done => {
    const options = {
      method: method,
      baseUrl: helpers.baseUrl,
      url: endpoint,
      json: true,
    };
    const expectedStatusCode = 200;

    request(options, (err, response) => {
      if (err) {
        done(err);
      } else {
        const { body, statusCode } = response;
        statusCode.should.equal(expectedStatusCode);
        should.deepEqual(body, []);
        done();
      }
    });
  });
});

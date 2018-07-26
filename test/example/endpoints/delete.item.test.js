const request = require('request');
const rewire = require('rewire');
const sinon = require('sinon');
const helpers = require('../../helpers');
const collection = require('../../../example/collections/items');

const endpoint = '/item';
const method = 'DELETE';

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
      .stub(helpers.collectionItems, 'remove')
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

  it('should return 404 when id is not found', done => {
    const id = 'aaaaaaaaaaaaaaaaaaaaaaaa';
    const options = {
      method: method,
      baseUrl: helpers.baseUrl,
      url: `${endpoint}/${id}`,
      json: true,
    };
    const expectedStatusCode = 404;

    request(options, (err, response) => {
      if (err) {
        done(err);
      } else {
        const { body, statusCode } = response;
        statusCode.should.equal(expectedStatusCode);
        should.deepEqual(body, {
          status: 0,
          error: 'Item not found',
          details: '',
        });
        done();
      }
    });
  });

  it('should succeed to delete the item', done => {
    const options = {
      method: method,
      baseUrl: helpers.baseUrl,
      url: endpoint,
      json: true,
    };
    const expectedStatusCode = 200;

    collection
      .add({ test: true })
      .then(res => {
        const _id = res._id.toString();
        options.url += `/${_id}`;
        request(options, (err, response) => {
          if (err) {
            done(err);
          } else {
            const { body, statusCode } = response;
            statusCode.should.equal(expectedStatusCode);
            should.deepEqual(body, { n: 1 });
            done();
          }
        });
      })
      .catch(done);
  });
});

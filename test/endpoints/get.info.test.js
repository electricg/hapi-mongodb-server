const request = require('request');
const rewire = require('rewire');

const helpers = require('../helpers');
const pkg = require('../../package.json');

const endpoint = '/';
const method = 'GET';

describe(`${method} ${endpoint}`, () => {
  const _server = rewire('../../src/lib/server');

  before(async () => {
    await _server.start();
  });

  after(async () => {
    await _server.stop();
  });

  it('should succeed to return server informations', done => {
    const options = {
      method: method,
      baseUrl: helpers.baseUrl,
      url: endpoint,
      json: true,
    };
    const statusCode = 200;

    request(options, (err, response) => {
      if (err) {
        done(err);
      } else {
        response.statusCode.should.equal(statusCode);
        const { body } = response;
        const { name, version } = pkg;
        const expectedBody = { name, version };
        should.deepEqual(body, expectedBody);
        done();
      }
    });
  });
});

const request = require('request');
const rewire = require('rewire');
const sinon = require('sinon');

const pkg = require('../../package.json');
const helpers = require('../helpers');

describe('API Server', () => {
  const _server = rewire('../../src/lib/server');

  before(() => {
    _server.init({
      port: helpers.config.get('port'),
      host: helpers.config.get('host'),
      origin: helpers.config.get('allowedOrigins'),
      routes: helpers.config.get('routes'),
    });
  });

  afterEach(async () => {
    await helpers.serverStop();
    await _server.stop();
  });

  it('should throw error when trying to start it because another server is already running', done => {
    helpers
      .serverStart()
      .then(_server.start)
      .then(() => {
        done('there should be an error');
      })
      .catch(err => {
        const expectedError = {
          status: 0,
          error: 'Attempted to start the server',
          details: `listen EADDRINUSE ${helpers.config.get(
            'host'
          )}:${helpers.config.get('port')}`,
        };
        should.deepEqual(err, expectedError);
        done();
      });
  });

  it('should successfully start', done => {
    _server
      .start()
      .then(() => {
        helpers.utilsLogStub
          .withArgs('Server started at:', helpers.baseUrl)
          .calledOnce.should.equal(true);

        const options = {
          method: 'GET',
          baseUrl: helpers.baseUrl,
          url: '/',
          json: true,
        };

        request(options, (err, response) => {
          if (err) {
            done(err);
          } else {
            response.statusCode.should.equal(200);
            const body = response.body;
            const { name, version } = pkg;
            should.deepEqual(body, { name, version });
            done();
          }
        });
      })
      .catch(done);
  });

  it('should successfully stop', done => {
    const options = {
      method: 'GET',
      baseUrl: helpers.baseUrl,
      url: '/',
      json: true,
    };

    _server
      .start()
      .then(() => {
        return new Promise((resolve, reject) => {
          request(options, (err, response) => {
            if (err) {
              return reject(err);
            } else {
              response.statusCode.should.equal(200);
              const body = response.body;
              const { name, version } = pkg;
              should.deepEqual(body, { name, version });
              return resolve();
            }
          });
        });
      })
      .then(_server.stop)
      .then(() => {
        helpers.utilsLogStub
          .withArgs('Server stopped')
          .calledOnce.should.equal(true);

        request(options, err => {
          if (err) {
            done();
          } else {
            done('there should be an error');
          }
        });
      })
      .catch(done);
  });

  it('should throw error when trying to stop it because is already stopped', done => {
    const hapiServer = _server.__get__('server');
    const _hapiServerStub = sinon.stub(hapiServer, 'stop').callsFake(() => {
      return Promise.reject(new Error('fake'));
    });

    _server
      .stop()
      .then(() => {
        _hapiServerStub.restore();
        done('there should be an error');
      })
      .catch(err => {
        const expectedError = {
          status: 0,
          error: 'Attempted to stop the server',
          details: 'fake',
        };
        should.deepEqual(err, expectedError);
        _hapiServerStub.restore();
        done();
      });
  });
});

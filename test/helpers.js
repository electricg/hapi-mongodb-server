const nock = require('nock');
const sinon = require('sinon');
const Mongoose = require('mongoose').Mongoose;
const Mockgoose = require('mockgoose').Mockgoose;

const config = require('../src/lib/config');
const utils = require('../src/lib/utils');
const db = require('../src/lib/db');
const server = require('../src/lib/server');

const mongoose = new Mongoose();
const mockgoose = new Mockgoose(mongoose);

// Doing this because otherwise Mockgoose connects to the real MongoDB and not to the one in the RAM
// https://github.com/Mockgoose/Mockgoose/issues/22#issuecomment-328848967
Mockgoose.prototype.prepareStorage = function(port) {
  const _this = this;
  return new Promise(resolve => {
    Promise.all([_this.getTempDBPath(), _this.getOpenPort()]).then(
      promiseValues => {
        const dbPath = promiseValues[0];
        const openPort = port;
        const storageEngine = _this.getMemoryStorageName();
        const mongodArgs = [
          '--port',
          openPort,
          '--storageEngine',
          storageEngine,
          '--dbpath',
          dbPath,
        ];
        _this.mongodHelper.mongoBin.commandArguments = mongodArgs;
        const mockConnection = () => {
          _this.mockConnectCalls(_this.getMockConnectionString(openPort));
          resolve();
        };
        _this.mongodHelper
          .run()
          .then(mockConnection)
          .catch(mockConnection);
      }
    );
  });
};

module.exports.config = config;
module.exports.db = db;

module.exports.baseUrl = `http://${config.get('host')}:${config.get('port')}`;

let getConfigStub;
module.exports.dbStart = async () => {
  // Doing this because otherwise Mockgoose connects to the real MongoDB and not to the one in the RAM
  const PORT = 27016;
  getConfigStub = sinon.stub(config, 'get');
  getConfigStub
    .withArgs('mongodbUrl')
    .returns(`mongodb://localhost:${PORT}/test`);
  await mockgoose.prepareStorage(PORT);

  await db.connect();
};

module.exports.dbStop = async () => {
  getConfigStub.restore();
  await db.close();
  // Probably not needed anymore, but keeping it just in case
  // https://github.com/Mockgoose/Mockgoose/issues/33#issuecomment-321835220
  // mockgoose.mongodHelper.mongoBin.childProcess.kill('SIGKILL');
};

module.exports.dbReset = async () => {
  await mockgoose.helper.reset();
  const collections = Object.keys(db.db.collections);
  collections.map(async collection => {
    await db.db.collection(collection).remove();
  });
};

module.exports.serverStart = async () => {
  await server.start();
};

module.exports.serverStop = async () => {
  await server.stop();
};

let utilsLogStub = {};
const activateUtilsLogStub = () => {
  utilsLogStub = sinon.stub(utils, 'log').callsFake(() => {});
};
activateUtilsLogStub();
module.exports.utilsLogStub = utilsLogStub;
module.exports.activateUtilsLogStub = activateUtilsLogStub;

afterEach(async () => {
  nock.cleanAll();
  utilsLogStub.resetHistory();
});

after(async () => {
  utilsLogStub.restore();
});

// Probably not needed anymore, but keeping it just in case
// https://github.com/nodejs/node/issues/9523#issuecomment-259303079
// process.on('unhandledRejection', r => console.log(r));

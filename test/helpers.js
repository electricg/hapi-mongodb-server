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

const mongodbUrl = config.get('mongodbUrl');
const testMongodbUrl = `${mongodbUrl}-test`;

let getConfigStub;

module.exports.config = config;
module.exports.db = db;

module.exports.baseUrl = `http://${config.get('host')}:${config.get('port')}`;

module.exports.dbStart = async () => {
  // Doing this because otherwise Mockgoose connects to the real MongoDB if this is active
  getConfigStub = sinon.stub(config, 'get');
  getConfigStub.withArgs('mongodbUrl').returns(testMongodbUrl);

  await mockgoose.prepareStorage();
  await db.connect();
};

module.exports.dbStop = async () => {
  await db.db.dropDatabase();
  await db.close();
  getConfigStub.restore();
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

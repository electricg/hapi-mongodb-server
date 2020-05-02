/* global before, afterEach, after */

const Mongoose = require('mongoose').Mongoose;
const Mockgoose = require('mockgoose').Mockgoose;

const db = require('../src/db');

const mongoose = new Mongoose();
const mockgoose = new Mockgoose(mongoose);

const dbStart = async ({ uri, options }) => {
  await mockgoose.prepareStorage();
  db.setup({ uri, options });
  await db.connect();
};

const dbStop = async () => {
  await db.db.dropDatabase();
  await db.close();
  // Probably not needed anymore, but keeping it just in case
  // https://github.com/Mockgoose/Mockgoose/issues/33#issuecomment-321835220
  // mockgoose.mongodHelper.mongoBin.childProcess.kill('SIGKILL');
};

const dbReset = async () => {
  await mockgoose.helper.reset();
  const collections = Object.keys(db.db.collections);
  collections.map(async collection => {
    await db.db.collection(collection).remove();
  });
};

module.exports.dbStart = dbStart;
module.exports.dbStop = dbStop;
module.exports.dbReset = dbReset;

module.exports.db = db;

before(async () => {
  await dbStart({ uri: helpers.testMongodbUrl });
});

afterEach(async () => {
  await dbReset();
});

after(async () => {
  await dbStop();
});

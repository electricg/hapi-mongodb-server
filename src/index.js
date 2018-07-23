const utils = require('./lib/utils');
const server = require('./lib/server');
const db = require('./lib/db');
const config = require('./lib/config');

module.exports.start = async () => {
  await db
    .connect({ uri: config.get('mongodbUrl') })
    .then(() => server.start())
    .then(() => {
      utils.log('The fake api server is ready!');
    })
    .catch(err => {
      utils.log(utils.formatError(err));
    });
};

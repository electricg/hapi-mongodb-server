const utils = require('./lib/utils');
const server = require('./lib/server');
const db = require('./lib/db');

module.exports.start = async () => {
  await db
    .connect()
    .then(() => server.start())
    .then(() => {
      utils.log('The fake api server is ready!');
    })
    .catch(err => {
      utils.log(utils.formatError(err));
    });
};

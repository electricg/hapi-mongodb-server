const utils = require('./utils');
const server = require('./server');
const db = require('./db');

module.exports.start = async options => {
  db.setup(options.db);
  await db
    .connect()
    .then(() => {
      server.init(options.server);
      return server.start();
    })
    .then(() => {
      utils.log('The fake api server is ready!');
    })
    .catch(err => {
      utils.log(utils.formatError(err));
    });
};

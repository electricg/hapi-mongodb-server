const Hapi = require('hapi');
const utils = require('./utils');

let server;

module.exports.init = ({ port, host, origin, routes }) => {
  server = new Hapi.Server({
    port,
    host,
    routes: { cors: { origin: origin } },
  });

  routes.forEach(route => {
    server.route(route);
  });
};

module.exports.start = async () => {
  try {
    await server.start();
    utils.log('Server started at:', server.info.uri);
  } catch (err) {
    throw utils.formatError('Attempted to start the server', err);
  }
};

module.exports.stop = async () => {
  try {
    await server.stop();
    utils.log('Server stopped');
  } catch (err) {
    throw utils.formatError('Attempted to stop the server', err);
  }
};

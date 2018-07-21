const Hapi = require('hapi');
const config = require('./config');
const utils = require('./utils');
const routes = require('./routes');

const server = new Hapi.Server({
  port: config.get('port'),
  host: config.get('host'),
  routes: { cors: { origin: config.get('allowedOrigins') } },
});

routes.forEach(route => {
  const { method, path, module } = route;
  const mod = require(`../endpoints/${module}`);
  const { handler } = mod;
  const options = {
    method,
    path,
    handler,
  };

  server.route(options);
});

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

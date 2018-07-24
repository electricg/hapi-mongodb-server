const api = require('../src/index');
const config = require('./config');

const settings = {
  db: {
    uri: config.get('mongodbUrl'),
    options: {},
  },
  server: {
    port: config.get('port'),
    host: config.get('host'),
    origin: config.get('allowedOrigins'),
    routes: config.get('routes'),
  },
};

api.start(settings);

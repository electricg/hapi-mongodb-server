const nconf = require('nconf');
const utils = require('./utils');

const pkg = require('../../package');
const { name } = pkg;

const DEFAULT = {
  PORT: 8083,
  HOST: '127.0.0.1',
  MONGODB_URI: `mongodb://localhost:27017/${name}`,
  CLIENTS: '*',
};

nconf
  .env()
  .file(`${__dirname}/../config.json`)
  .defaults(DEFAULT);

// some of the settings need parsing, so we create a public layer accessible to the application, while hiding the original ones
nconf.set('public:port', ~~nconf.get('PORT'));
nconf.set('public:host', nconf.get('HOST'));
nconf.set('public:mongodbUrl', nconf.get('MONGODB_URI'));
nconf.set('public:allowedOrigins', utils.formatOrigins(nconf.get('CLIENTS')));

module.exports.get = param => {
  return nconf.get(`public:${param}`);
};
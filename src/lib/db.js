const mongoose = require('mongoose');
const utils = require('./utils');

let db = mongoose.connection;

let mongodbUri = '';
let mongodbOptions = {
  autoReconnect: true,
  connectTimeoutMS: 3600000,
  keepAlive: 3600000,
  socketTimeoutMS: 3600000,
  useNewUrlParser: true,
};

const setup = ({ uri, options } = {}) => {
  if (uri) {
    mongodbUri = uri;
  }

  if (options) {
    mongodbOptions = { ...mongodbOptions, ...options };
  }
};

const connect = async () => {
  await mongoose.connect(
    mongodbUri,
    mongodbOptions
  );
};

const close = async () => {
  await mongoose.disconnect();
};

const reconnect = async () => {
  if (db.readyState === 0) {
    await connect();
    db = mongoose.connection;
  }
};

module.exports.setup = setup;
module.exports.connect = connect;
module.exports.reconnect = reconnect;
module.exports.close = close;

module.exports.db = db;
module.exports.ObjectId = mongoose.Types.ObjectId;

db.on('close', () => {
  utils.log('Connection to MongoDB closed');
});

db.on('connected', () => {
  utils.log(
    'Connection established to MongoDB at:',
    `mongodb://${db.host}:${db.port}/${db.name}`
  );
});

db.on('error', err => {
  utils.log('Error', `${err.name}: ${err.message}`);
});

db.on('disconnected', () => {
  utils.log('Error', 'Lost MongoDB connection');
});

db.on('reconnected', () => {
  utils.log('Reconnected to MongoDB');
});

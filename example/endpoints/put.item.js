const utils = require('../../src/utils');
const collection = require('../collections/items');

module.exports.handler = (request, h) => {
  return new Promise(resolve => {
    const { id } = request.params;
    resolve({ id });
  });
};

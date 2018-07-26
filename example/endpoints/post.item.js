const utils = require('../../src/utils');
const collection = require('../collections/items');

module.exports.handler = (request, h) => {
  return new Promise(resolve => {
    const { payload } = request;
    collection
      .add(payload)
      .then(doc => {
        resolve(doc);
      })
      .catch(err => {
        resolve(
          h.response(utils.formatError('Internal MongoDB error', err)).code(500)
        );
      });
  });
};

const utils = require('../../src/utils');
const collection = require('../collections/items');

module.exports.handler = (request, h) => {
  return new Promise(resolve => {
    const { params, payload } = request;
    const { id } = params;
    collection
      .put({ id, body: payload })
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

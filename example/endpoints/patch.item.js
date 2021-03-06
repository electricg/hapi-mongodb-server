const utils = require('../../src/utils');
const collection = require('../collections/items');

module.exports.handler = (request, h) => {
  return new Promise(resolve => {
    const { params, payload } = request;
    const { id } = params;
    collection
      .patch({ id, body: payload })
      .then(doc => {
        resolve(doc);
      })
      .catch(err => {
        if (err === 404) {
          return resolve(
            h.response(utils.formatError('Item not found', err)).code(404)
          );
        }

        resolve(
          h.response(utils.formatError('Internal MongoDB error', err)).code(500)
        );
      });
  });
};

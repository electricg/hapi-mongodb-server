const db = require('../src/db');

const list = [
  {
    method: 'GET',
    path: '/',
    module: 'get.info',
  },
  {
    method: 'GET',
    path: '/items',
    module: 'get.items',
  },
  {
    method: 'POST',
    path: '/item',
    module: 'post.item',
  },
  {
    method: 'GET',
    path: '/item/{id}',
    module: 'get.item',
  },
  {
    method: 'DELETE',
    path: '/item/{id}',
    module: 'delete.item',
  },
  {
    method: 'PATCH',
    path: '/item/{id}',
    module: 'patch.item',
  },
  {
    method: 'PUT',
    path: '/item',
    module: 'put.item',
  },
  {
    method: 'PUT',
    path: '/item/{id}',
    module: 'put.item',
  },
  {
    method: 'PATCH',
    path: '/item/validate/{id}',
    module: 'patch.item.validate',
  },
];

const routes = list.map(route => {
  const { method, path, module } = route;
  const mod = require(`./endpoints/${module}`);
  const { handler, validate } = mod;
  const options = {
    method,
    path,
    handler,
    config: {
      pre: [
        {
          method: request => {
            db.reconnect();
            return request;
          },
        },
      ],
    },
  };

  if (method !== 'GET') {
    options.config.payload = { allow: 'application/json' };
  }

  if (validate) {
    options.config.validate = validate;
  }

  return options;
});

module.exports = routes;

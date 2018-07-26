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
    method: 'POST',
    path: '/item/{id}',
    module: 'post.item',
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
];

const routes = list.map(route => {
  const { method, path, module } = route;
  const mod = require(`./endpoints/${module}`);
  const { handler } = mod;
  const options = {
    method,
    path,
    handler,
  };

  return options;
});

module.exports = routes;

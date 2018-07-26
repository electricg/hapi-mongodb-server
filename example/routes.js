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

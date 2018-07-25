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

# hapi-mongodb-server

Basic API server made with hapi and MongoDB.

## How to install

```bash
npm install @electricg/hapi-mongodb-server
```

## How to use

A complete example is available in the `example` directory.

```js
const api = require("@electricg/hapi-mongodb-server");

const port = 8083;
const host = "127.0.0.1";
const mongodbUrl = "mongodb://localhost:27017/test";
const mongodbOptions = {
  autoReconnect: true
};
const allowedOrigins = ["*"];
const routes = [
  {
    method: "GET",
    path: "/",
    handler: handler: () => {
      return { name: "test", version: "1.0.0" };
    }
  }
];

const settings = {
  db: {
    uri: mongodbUrl,
    options: mongodbOptions
  },
  server: {
    port: port,
    host: host,
    origin: allowedOrigins,
    routes: routes
  }
};

api.start(settings);
```

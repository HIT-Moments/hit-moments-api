const express = require('express');

const apiRoute = express.Router();

const routesApi = [
  {
    path: '/users',
    route: require('./user.route'),
  },
  {
    path: '/reports',
    route: require('./report.route'),
  },
];

routesApi.forEach((route) => {
  apiRoute.use(route.path, route.route);
});

module.exports = apiRoute;
